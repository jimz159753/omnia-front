import axios, { AxiosInstance } from 'axios'

const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_CAL_API,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CAL_TOKEN}`
      },
})

export default axiosClient;