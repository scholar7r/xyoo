import { Logger } from "tslog";
import { xyooAxios } from "./XyooAxios";
import { xybMstv } from "./Mstv";

const logger = new Logger();

const endpointUrls = {
  user: {
    credentialLogin: "https://xcx.xybsyw.com/login/login.action",
    details: "https://xcx.xybsyw.com/account/LoadAccountInfo.action",
  },
  clock: {
    detailDefault:
      "https://xcx.xybsyw.com/student/clock/GetPlan!getDefault.action",
    doClock: "https://xcx.xybsyw.com/student/clock/PostNew.action",
    updateClock: "https://xcx.xybsyw.com/student/clock/Post!updateClock.action",
    history: "https://xcx.xybsyw.com/student/clock/PunchIn!historyList.action",
  },
  regeo: "https://restapi.amap.com/v3/geocode/regeo",
  pusher: {
    qmsg: "https://qmsg.zendee.cn/send",
  },
};

interface UserCrentialLoginResponseOpt {
  code: string;
  data: {
    sessionId: string;
  };
}

interface UserDetailsResponseOpt {
  code: string;
  data: {
    loginer: string;
  };
}

interface ClockDetailDefaultResponseOpt {
  code: string;
  data: {
    clockVo: {
      traineeId: string;
    };
  };
}

interface ClockDetailResponseOpt {}

interface ClockDoClockResponseOpt {
  code: string;
  data: {
    startTraineeDayNum: number;
    signPersonNum: number;
    startDayNum: number;
  };
  msg: string;
}

interface ClockUpdateClockResponseOpt {}

interface ClockHistoryResponseOpt {}

interface RegeoResponseOpt {
  status: string;
  regeocode: {
    addressComponent: {
      adcode: string;
    };
    formatted_address: string;
  };
}

interface PusherQmsgResponseOpt {}

interface PusherWxPusherResponseOpt {}

export const endpoints = {
  user: {
    credentialLogin: async (credentials: {
      phoneNumber: string;
      digestPassword: string;
      openId: string;
      unionId: string;
    }): Promise<UserCrentialLoginResponseOpt> => {
      return xyooAxios
        .request({
          url: endpointUrls.user.credentialLogin,
          params: {
            username: credentials.phoneNumber,
            password: credentials.digestPassword,
            openId: credentials.openId,
            unionId: credentials.unionId,
          },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error.data);
        });
    },
    details: async (sessionId: string): Promise<UserDetailsResponseOpt> => {
      return xyooAxios
        .request({
          url: endpointUrls.user.details,
          headers: {
            Cookie: `JSESSIONID=${sessionId}`,
          },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error.data);
        });
    },
  },
  clock: {
    detailDefault: async (
      sessionId: string,
    ): Promise<ClockDetailDefaultResponseOpt> => {
      return xyooAxios
        .request({
          url: endpointUrls.clock.detailDefault,
          headers: { Cookie: `JSESSIONID=${sessionId}` },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error.data);
        });
    },
    doClock: async (clockOpt: {
      sessionId: string;
      traineeId: string;
      deviceName: string;
      adcode: string;
      lat: number;
      lng: number;
      address: string;
      reason?: string;
    }): Promise<ClockDoClockResponseOpt> => {
      // Before submit clock information, it should request amap regeo endpoint to get detialed information

      const clockOptForm = {
        traineeId: clockOpt.traineeId,
        adcode: clockOpt.adcode,
        lat: clockOpt.lat,
        lng: clockOpt.lng,
        address: clockOpt.address,
        deviceName: clockOpt.deviceName,
        punchInStatus: "1",
        // NOTE
        // ClockStatus is a boolean switch to identify is user clocked, if it's value is 1,
        // backend will run clock-out because user is already clocked-in, if it's value is 2,
        // it will do clock-in because user did nothing
        //
        // When develop clock-out function, doClock function can got clockStatus from arguments,
        // and do things like "if you have clocked-in, let me help you to clock-out"
        clockStatus: "2",
        addressId: null,
        // NOTE
        //
        // This two arguments is for the special, when a clock needs to upload a image or leave a reason.
        // In default case, it is disabled, this two arguments will be enabled in next version
        imgUrl: "",
        reason: clockOpt.reason || "",
      };

      return xyooAxios
        .request({
          url: endpointUrls.clock.doClock,
          headers: {
            Cookie: `JSESSIONID=${clockOpt.sessionId}`,
            ...xybMstv(clockOptForm),
          },
          params: { ...clockOptForm },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error.data);
        });
    },
    updateClock: async () => {},
    history: async () => {},
  },
  regeo: async (address: string, key: string): Promise<RegeoResponseOpt> => {
    return xyooAxios
      .request({
        url: endpointUrls.regeo,
        params: {
          key,
          location: address,
          s: "rsx",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error.data);
      });
  },
  pusher: {
    qmsg: async () => {},
    wxPusher: async () => {},
  },
};
