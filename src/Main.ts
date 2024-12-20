import { Command } from "commander";
import { Configuration, ConfigurationOpt } from "./domains/Configuration";
import { Logger } from "tslog";
import { endpoints } from "./services/Endpoints";

const logger = new Logger();

const main = async () => {
  const runClock = async (isClockOut: boolean, targetFile: string) => {
    const configuration: ConfigurationOpt = new Configuration(
      targetFile,
    ).read();

    if (isClockOut) {
      // Do clock out
      logger.info(`Run clout-out process`);
    } else {
      // Do clock in
      logger.info(`Run clout-in process`);

      for (const element of configuration.users) {
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

        if (sessionId == null) continue;
        const loginer = await endpoints.user
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
          .regeo(element.address, configuration.endpointSettings.amap.key)
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

        if (traineeId == null) continue;
        if (!address) continue;
        await endpoints.clock
          .doClock({
            sessionId,
            traineeId,
            deviceName: element.deviceName,
            adcode: address.adcode,
            lat: element.address.split(",").map(Number)[1],
            lng: element.address.split(",").map(Number)[0],
            address: address.formattedAddress,
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
      }
    }
  };

  const program = new Command();

  program
    .name("Xyoo")
    .description("Simplify clock way of Xiao Youbang")
    .version("1.0.0");

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
    .action(async (args: { target: string }) => {
      await runClock(true, args.target);
    });

  // Jokes on Mamba
  program
    .command("mamba")
    .description("run clock-out process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .action(async (args: { target: string }) => {
      logger.info("What can I say? Mamba out!");
      await runClock(true, args.target);
    });

  program.parse();
};

main();
