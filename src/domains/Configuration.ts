import { createHash } from "crypto";
import { readFileSync } from "fs";
import { parse } from "yaml";

interface ConfigurationUsersOpt {
  openId: string;
  unionId: string;
}

export interface ConfigurationOpt {
  openIdPool: string[];
  users: ConfigurationUsersOpt[];
}

/**
 * @example
 * const configuration: ConfigurationOpt = new Configuration('xyoo.yaml').read();
 */
export class Configuration {
  private configuration: ConfigurationOpt;

  /**
   * @constructor
   *
   * @param filename - target configuration filename
   */
  constructor(filename: string) {
    const buffer = readFileSync(filename, "utf8");
    const configuration: ConfigurationOpt = parse(buffer);

    this.configuration = configuration;
  }

  /**
   * Read content in target configuration file
   */
  public read() {
    return this.configuration;
  }
}
