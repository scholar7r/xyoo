import { Command } from "commander";
import {
  Configuration,
  ConfigurationOpt,
  ConfigurationUsersOpt,
} from "./domains/Configuration";
import { Logger } from "tslog";
import { endpoints } from "./services/Endpoints";

const logger = new Logger();

const main = async () => {
  const runClock = async (isClockOut: boolean, targetFile: string) => {
    const configuration: ConfigurationOpt = new Configuration(
      targetFile,
    ).read();

    if (isClockOut) {
      logger.info(`Run clout-out process`);
    } else {
      logger.info(`Run clout-in process`);

      for (const user of configuration.users) {
        const sessionId = await workflows.credentialLogin(user);
        if (!sessionId) continue;

        const traineeId = await workflows.fetchTraineeId(sessionId);
        if (!traineeId) continue;

        const address = await workflows.fetchAddress(
          user.address,
          configuration.endpointSettings.amap.key,
        );
        if (!address) continue;

        await workflows.doClock({
          sessionId,
          traineeId,
          deviceName: user.deviceName,
          adcode: address.addressCode,
          address: address.formattedAddress,
          lat: user.address.split(",").map(Number)[1],
          lng: user.address.split(",").map(Number)[0],
        });

        logger.info(`Tasks completed for current user`);
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

const workflows = {
  credentialLogin: async (user: ConfigurationUsersOpt): Promise<string> => {
    const response = await endpoints.user.credentialLogin(user);

    if (response?.data?.sessionId) {
      const sessionId = response.data.sessionId;
      logger.info("Current user has logged in successfully");
      logger.debug(`Got sessionId from response: ${sessionId}`);
      return sessionId;
    }

    logger.error(`Login failed with response code: ${response.code}`);
    throw new Error(`Login failed with response code: ${response.code}`);
  },
  fetchLoginer: async (sessionId: string): Promise<string> => {
    const response = await endpoints.user.details(sessionId);

    if (response?.data?.loginer) {
      const loginer = response.data.loginer;
      logger.debug(`Got loginer from response: ${loginer}`);
      return loginer;
    }

    logger.error(
      `Failed to fetch loginer with response code: ${response.code}`,
    );
    throw new Error(
      `Failed to fetch loginer with response code: ${response.code}`,
    );
  },
  fetchTraineeId: async (sessionId: string): Promise<string> => {
    const response = await endpoints.clock.detailDefault(sessionId);

    if (response?.data?.clockVo?.traineeId) {
      const traineeId = response.data.clockVo.traineeId;
      logger.debug(`Got traineeId from response: ${traineeId}`);
      return traineeId;
    }

    logger.error(
      `Failed to fetch traineeId with response code: ${response.code}`,
    );
    throw new Error(
      `Failed to fetch traineeId with response code: ${response.code}`,
    );
  },
  fetchAddress: async (
    address: string,
    key: string,
  ): Promise<{ formattedAddress: string; addressCode: string }> => {
    const response = await endpoints.regeo(address, key);

    if (
      response?.regeocode?.formatted_address &&
      response?.regeocode?.addressComponent?.adcode
    ) {
      const formattedAddress = response.regeocode.formatted_address;
      const addressCode = response.regeocode.addressComponent.adcode;
      logger.debug(
        `Got address information from endpoint: [${addressCode}] ${formattedAddress}`,
      );
      return { formattedAddress, addressCode };
    }

    logger.error(
      `Failed to fetch address information with response code: ${response.status}`,
    );
    throw new Error(
      `Failed to fetch address information with response code: ${response.status}`,
    );
  },
  doClock: async (form: {
    sessionId: string;
    traineeId: string;
    deviceName: string;
    adcode: string;
    lat: number;
    lng: number;
    address: string;
    reason?: string;
  }) => {
    const CLOCKED_IN_FLAG = "已经签到";
    const response = await endpoints.clock.doClock(form);

    if (response?.code === "200" && response?.msg != CLOCKED_IN_FLAG) {
      logger.info("Successful clock-in for current user");
    } else {
      logger.warn("Current account is already clocked-in");
      return;
    }

    logger.error(`Failed to clock with response code: ${response.code}`);
    throw new Error(`Failed to clock with response code: ${response.code}`);
  },
};

main();
