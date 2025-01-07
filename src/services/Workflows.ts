import { Logger } from "tslog";
import {
  ConfigurationOpt,
  ConfigurationUsersOpt,
} from "../domains/Configuration";
import { endpoints } from "./Endpoints";

const logger = new Logger();

/**
 * Workflows contains functions to handle processes
 */
export const workflows = {
  credentialLogin: async (
    user: ConfigurationUsersOpt,
  ): Promise<string | null> => {
    const response = await endpoints.user.credentialLogin(user);

    if (response?.data?.sessionId) {
      const sessionId = response.data.sessionId;
      logger.info("Current user has logged in successfully");
      logger.debug(`Got sessionId from response: ${sessionId}`);
      return sessionId;
    }

    logger.error("Current account failed to login, passed");
    return null;
  },
  fetchLoginer: async (sessionId: string): Promise<string | null> => {
    const response = await endpoints.user.details(sessionId);

    if (response?.data?.loginer) {
      const loginer = response.data.loginer;
      logger.debug(`Got loginer from response: ${loginer}`);
      return loginer;
    }

    return null;
  },
  fetchTraineeId: async (sessionId: string): Promise<string | null> => {
    const response = await endpoints.clock.detailDefault(sessionId);

    if (response?.data?.clockVo?.traineeId) {
      const traineeId = response.data.clockVo.traineeId;
      logger.debug(`Got traineeId from response: ${traineeId}`);
      return traineeId;
    }

    return null;
  },
  fetchAddress: async (
    address: string,
    key: string,
  ): Promise<{ formattedAddress: string; addressCode: string } | null> => {
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

    return null;
  },
  doClock: async (form: {
    sessionId: string;
    traineeId: string;
    deviceName: string;
    adcode: string;
    lat: number;
    lng: number;
    isClockOut: boolean;
    address: string;
    reason?: string;
  }): Promise<boolean> => {
    const CLOCKED_IN_FLAG = "已经签到";
    const response = await endpoints.clock.doClock(form);

    if (response?.code === "200" && response?.msg != CLOCKED_IN_FLAG) {
      logger.info("Successful clock-in for current user");
      return true;
    } else if (response?.code === "202") {
      logger.error(`Failed to clock: ${response.msg}`);
    } else {
      logger.warn(
        `Current account is already ${form.isClockOut ? "clocked-out" : "clocked-in"}`,
      );
      return true;
    }

    throw new Error(`Failed to clock with response code: ${response.code}`);
  },
};

export const requestClock = async (
  user: ConfigurationUsersOpt,
  configuration: ConfigurationOpt,
  isClockOut: boolean,
) => {
  const sessionId = await workflows.credentialLogin(user);
  if (!sessionId) return false;

  const loginer = await workflows.fetchLoginer(sessionId);
  if (!loginer) return false;

  const traineeId = await workflows.fetchTraineeId(sessionId);
  if (!traineeId) return false;

  const address = await workflows.fetchAddress(
    user.address,
    configuration.endpointSettings.amap.key,
  );
  if (!address) return false;

  const isClockSuccess = await workflows.doClock({
    sessionId,
    traineeId,
    deviceName: user.deviceName,
    adcode: address.addressCode,
    address: address.formattedAddress,
    lat: user.address.split(",").map(Number)[1],
    lng: user.address.split(",").map(Number)[0],
    isClockOut,
  });

  if (isClockSuccess) {
    logger.info(`${isClockOut ? "Clock-out" : "Clock-in"} finished`);
    return true;
  }

  logger.error("An unknown error caused clock cannot continue");
  return false;
};
