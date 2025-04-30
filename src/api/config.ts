import axios, { AxiosInstance } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CAL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
