import axiosClient from "../config";
import { IEventTypeResponse } from "@/constants";

const getEventTypes = async () => {
   const response = await axiosClient.get<IEventTypeResponse>("/event-type")
   return response.data.data;
};

export { getEventTypes };
