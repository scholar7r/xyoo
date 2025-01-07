import { Command } from "commander";
import { Configuration, ConfigurationOpt } from "./domains/Configuration";
import { Logger } from "tslog";
import { packageReader } from "./utilities/PackageReader";
import { credentialManager } from "./services/CredentialManager";
import { requestClock } from "./services/Workflows";

const logger = new Logger();

const main = async () => {
  const runClock = async (
    isClockOut: boolean,
    _isForce: boolean, // TODO: isForce variable controls if current clock use force clock to update
    targetFile: string,
  ) => {
    const configuration: ConfigurationOpt = new Configuration(
      targetFile,
    ).read();

    logger.info(
      `Found ${configuration.credentialsPool.length} ${configuration.credentialsPool.length > 1 ? "items" : "item"} in credentialsPool`,
    );
    let hasValidCredential: boolean = false;
    if (configuration.credentialsPool.length > 0) {
      await credentialManager.validateCredentials(
        configuration.credentialsPool,
      );
      const validCredentialsCount =
        credentialManager.grabValidCredentials().length;
      hasValidCredential = validCredentialsCount > 0;
      if (hasValidCredential) {
        logger.info(
          `There ${validCredentialsCount > 1 ? "are" : "is"} ${validCredentialsCount} ${validCredentialsCount > 1 ? "credentials" : "credential"} valid`,
        );
      }
    }

    logger.info(
      `Found ${configuration.users.length} ${configuration.users.length > 1 ? "users" : "user"} in configuration`,
    );
    logger.info(`Run ${isClockOut ? "clock-out" : "clock-in"} process`);

    for (const user of configuration.users) {
      // * Validate current credential is validate or not
      let isValidCredential: boolean = false;
      if (user.openId && user.unionId) {
        isValidCredential = await credentialManager
          .validateSingleCredential({
            openId: user.openId,
            unionId: user.unionId,
          })
          .then((result) => result);
      }

      if (isValidCredential) {
        logger.info("Current credential is valid");
        const isClockSuccess = await requestClock(
          user,
          configuration,
          isClockOut,
        );

        if (isClockSuccess) {
          logger.info(`${isClockOut ? "Clock-out" : "Clock-in"} finished`);
        }
      } else {
        logger.warn("Current credential is not valid");
        if (hasValidCredential) {
          logger.info(`Use a random credential in credentialsPool`);
          const credential = credentialManager.grabRandomCredential();
          if (credential) {
            user.openId = credential.openId;
            user.unionId = credential.unionId;
          }

          const isClockSuccess = await requestClock(
            user,
            configuration,
            isClockOut,
          );

          if (isClockSuccess) {
            logger.info(`${isClockOut ? "Clock-out" : "Clock-in"} finished`);
          } else {
            logger.error(`Clock failed`);
          }
        } else {
          logger.fatal("User credentials not satisfied, aborting");
        }
      }
    }
  };

  const program = new Command();

  program
    .name("xyoo")
    .description("Simplify clock way of Xiao Youbang")
    .version(packageReader.readVersion());

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
