import { Logger } from "tslog";
import { xyooAxios } from "./XyooAxios";
import { mstv } from "./Mstv";

const logger = new Logger();

const endpointUrls = {
  user: {
    credentialLogin: "https://xcx.xybsyw.com/login/login!wx.action",
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

interface ClockDoClockResponseOpt {}

interface ClockUpdateClockResponseOpt {}

interface ClockHistoryResponseOpt {}

interface RegeoResponseOpt {}

interface PusherQmsgResponseOpt {}

interface PusherWxPusherResponseOpt {}

export const endpoints = {
  user: {
    credentialLogin: async (credentials: {
      openId: string;
      unionId: string;
    }): Promise<UserCrentialLoginResponseOpt> => {
      return xyooAxios
        .request({
          url: endpointUrls.user.credentialLogin,
          params: {
            openId: credentials.openId,
            unionId: credentials.unionId,
          },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error);
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
          logger.error(error);
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
          logger.error(error);
        });
    },
    doClock: async (clockOpt: {
      sessionId: string;
      traineeId: string;
    }): Promise<ClockDoClockResponseOpt> => {
      const clockOptForm = {
        trainee: clockOpt.traineeId,
        adcode: "421202",
        lat: "NULL",
        lng: "NULL",
        address: "NULL",
        deviceName: "Vivo S18 Pro",
        punchInStatus: "1",
        clockStatus: "2",
        addressId: null,
        imgUrl: "",
        reason: "",
      };

      return xyooAxios
        .request({
          url: endpointUrls.clock.doClock,
          headers: {
            Cookie: `JSESSIONID=${clockOpt.sessionId}`,
            ...mstv(clockOptForm),
          },
          params: { ...clockOptForm },
        })
        .then((response) => response.data)
        .catch((error) => {
          logger.error(error);
        });
    },
    updateClock: async () => {},
    history: async () => {},
  },
  regeo: async () => {},
  pusher: {
    qmsg: async () => {},
    wxPusher: async () => {},
  },
};
