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

const login = async (email: string, password: string) => {
  const response = await axiosClient.post("/auth/signin", {
    email,
    password,
  });
  return response.data.access_token;
};

export { getEventTypes, getBookingsByEventTypeId, login };
