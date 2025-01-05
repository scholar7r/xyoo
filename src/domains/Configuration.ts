import { readFileSync } from "fs";
import { parse } from "yaml";

interface ConfigurationCredentialsPoolOpt {
  openId: string;
  unionId: string;
}

export interface ConfigurationUsersOpt {
  phoneNumber: string;
  digestPassword: string;
  openId: string;
  unionId: string;
  address: string;
  deviceName: string;
}

interface ConfigurationEndpointSettingsOpt {
  amap: {
    key: string;
  };
}

export interface ConfigurationOpt {
  credentialsPool: ConfigurationCredentialsPoolOpt[];
  users: ConfigurationUsersOpt[];
  endpointSettings: ConfigurationEndpointSettingsOpt;
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
