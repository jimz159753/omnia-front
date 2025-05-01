import axiosClient from "../config";
import { IBookingResponse, IEventTypeResponse } from "@/constants";

const getEventTypes = async () => {
   const response = await axiosClient.get<IEventTypeResponse>("/event-type")
   return response.data.data;
};

const getBookingsByEventTypeId = async (eventTypeIds: string) => {
  const response = await axiosClient.get<IBookingResponse>("/booking/by-type-event-ids", {
    params: {
      eventTypeIds:eventTypeIds,
    },
  });
  return response.data.data;
};

export { getEventTypes, getBookingsByEventTypeId };
