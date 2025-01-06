import { Command } from "commander";
import { Configuration, ConfigurationOpt } from "./domains/Configuration";
import { Logger } from "tslog";
import { workflows } from "./services/Workflows";

const logger = new Logger();

const main = async () => {
  const runClock = async (
    isClockOut: boolean,
    _isForce: boolean, // * isForce variable controls if current clock use force clock to update
    targetFile: string,
  ) => {
    const configuration: ConfigurationOpt = new Configuration(
      targetFile,
    ).read();
    logger.info(
      `Found ${configuration.users.length} ${configuration.users.length > 1 ? "users" : "user"} in configuration`,
    );
    logger.info(`Run ${isClockOut ? "clock-out" : "clock-in"} process`);

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
        isClockOut,
      });

      logger.info(`Tasks completed for current user`);
    }
  };

  const program = new Command();

  program
    .name("xyoo")
    .description("Simplify clock way of Xiao Youbang")
    .version("1.0.0");

  program
    .command("in")
    .description("run clock-in process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .option("-f, --force", "update clock-in to current clock")
    .action(async (args: { target: string; force: boolean }) => {
      await runClock(false, args.force, args.target);
    });

  program
    .command("out")
    .description("run clock-out process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .option("-f, --force", "update clock-out to current clock")
    .action(async (args: { target: string; force: boolean }) => {
      await runClock(true, args.force, args.target);
    });

  // Jokes on Mamba
  program
    .command("mamba")
    .description("run clock-out process")
    .option("-t, --target <filename>", "target configuration", "xyoo.yaml")
    .option("-f, --force", "update clock-out to current clock")
    .action(async (args: { target: string; force: boolean }) => {
      logger.info("What can I say? Mamba out!");
      await runClock(true, args.force, args.target);
    });

  program.parse();
};

main();
