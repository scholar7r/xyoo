import axios from "axios";
import { Logger } from "tslog";

const logger = new Logger();
export const xyooAxios = axios.create({
  timeout: 1000 * 10,
  timeoutErrorMessage: "Timeout when fetch endpoint",
});

xyooAxios.interceptors.request.use(
  (request) => {
    request.headers["Referer"] = "https://servicewechat.com/wx9f1c2e0bbc10673c";

    return request;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  },
);

xyooAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    logger.error(error.data);
    return Promise.reject(error.data);
  },
);
