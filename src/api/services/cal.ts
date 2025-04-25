import { AxiosResponse } from "axios";
import axiosClient from "../config";

const getEventTypes = (): Promise<AxiosResponse> => {
  return axiosClient.get("/event-types", {
    params: {
      username: "prueba140992",
    },
  }).then(res => res.data);
};

export { getEventTypes };
