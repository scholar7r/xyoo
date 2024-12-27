import { Command } from "commander";
import {
  Configuration,
  ConfigurationEndpointSettingsOpt,
  ConfigurationOpt,
  ConfigurationUsersOpt,
} from "./domains/Configuration";
import { Logger } from "tslog";
import { endpoints } from "./services/Endpoints";
import { schedule } from "node-cron";

const logger = new Logger();

/**
 * Main
 */
const main = async () => {
  /**
   * Clock-in or clock-out workflow
   *
   * @param element - Current user item in configuration
   * @param endpointSettings - Settings for endpoints
   * @param isClockIn - Is this workflow runs clock-in
   */
  const workflow = async (
    element: ConfigurationUsersOpt,
    endpointSettings: ConfigurationEndpointSettingsOpt,
    isClockIn: boolean,
  ) => {
    logger.info(
      `Execute ${isClockIn ? "clock-in" : "clock-out"} workflow now for ${element.openId.substring(0, 5)}`,
    );

    const sessionId = await endpoints.user
      .credentialLogin({
        openId: element.openId,
        unionId: element.unionId,
      })
      .then((response) => {
        if (response.code === "200") {
          logger.info("Current user has logged in successfully");
          logger.debug(
            `Got sessionId from response: ${response.data.sessionId}`,
          );
        } else {
          return Promise.reject(`Login failed for user: ${element.openId}`);
        }

        return response.data.sessionId;
      })
      .catch((error) => {
        logger.error(error);
      });

    if (sessionId == null) return;
    await endpoints.user
      .details(sessionId)
      .then((response) => {
        logger.debug(`Got loginer from response: ${response.data.loginer}`);

        return response.data.loginer;
      })
      .catch((error) => {
        logger.error(error);
      });

    const traineeId = await endpoints.clock
      .detailDefault(sessionId)
      .then((response) => {
        if (response.data.clockVo.traineeId) {
          logger.debug(
            `Got traineeId from response: ${response.data.clockVo.traineeId}`,
          );
        } else {
          return Promise.reject(
            `Failed to fetch traineeId from endpoint for ${element.openId}`,
          );
        }

        return response.data.clockVo.traineeId;
      })
      .catch((error) => {
        logger.error(error);
      });

    const address = await endpoints
      .regeo(element.address, endpointSettings.amap.key)
      .then((response) => {
        if (response.status == "1") {
          logger.debug(`Got address information from endpoint`);
        } else {
          return Promise.reject(
            `Failed to fetch address information from endpoint`,
          );
        }

        const addressComponent = {
          adcode: response.regeocode.addressComponent.adcode,
          formattedAddress: response.regeocode.formatted_address,
        };

        return addressComponent;
      })
      .catch((error) => {
        logger.error(error);
      });

    if (traineeId == null) return;
    if (!address) return;
    await endpoints.clock
      .doClock({
        sessionId,
        traineeId,
        deviceName: element.deviceName,
        adcode: address.adcode,
        lat: element.address.split(",").map(Number)[1],
        lng: element.address.split(",").map(Number)[0],
        address: address.formattedAddress,
        isClockIn: isClockIn,
      })
      .then((response) => {
        if (response.code) {
          logger.info("Successful clock-in for current user");
        } else {
          return Promise.reject(`Failed to clock-in for current user`);
        }
      })
      .catch((error) => {
        logger.error(error);
      });

    logger.info("Current user's tasks are completed");
  };

  /**
   * Run clock-out or clock-in process
   *
   * @param isClockOut - Is this clock runs clock-out process
   * @param targetFile - Target configuration file
   */
  const runClock = async (isClockOut: boolean, targetFile: string) => {
    const configuration: ConfigurationOpt = new Configuration(
      targetFile,
    ).read();

    const userItemsLength = configuration.users.length;
    logger.info(
      `Found ${userItemsLength} ${userItemsLength < 2 ? "user" : "users"} in current configuration`,
    );

    for (const element of configuration.users) {
      const isScheduled = !!element.cron;

      if (isScheduled) {
        schedule(element.cron, async () => {
          await workflow(element, configuration.endpointSettings, !isClockOut);
        });
      } else {
        logger.warn(
          `Current openId ${element.openId.substring(0, 5)} not set cron value, run once`,
        );

        await workflow(element, configuration.endpointSettings, !isClockOut);
      }
    }
  };

  // Proagram client
  const program = new Command();

  program
    .name("Xyoo")
    .description("Simplify clock client of Xiao Youbang")
    .version("1.0.0");

  // All commands provided a daemon option to run clock process with a daemon,
  // if daemon is enabled, it should be an argument to transport crontab rules
  program
    .command("in")
    .description("run clock-in process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .action(async (args: { target: string }) => {
      await runClock(false, args.target);
    });

  program
    .command("out")
    .description("run clock-out process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .option("-d, --daemon", "run with a daemon")
    .action(async (args: { target: string }) => {
      await runClock(true, args.target);
    });

  // Jokes on Mamba
  program
    .command("mamba")
    .description("run clock-out process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .option("-d, --daemon", "run with a daemon")
    .action(async (args: { target: string }) => {
      logger.info("What can I say? Mamba out!");
      await runClock(true, args.target);
    });

  // Parse program setups
  program.parse();
};

// Main function is a async function, it is better to use Promise to handle
// situations in error or some warrings
main();
