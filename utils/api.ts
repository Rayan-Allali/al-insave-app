import { baseUrl } from "@/constants/baseApi";
import axios from "axios";

const statiqueToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODc5YmVhNmQ1NzcxNjQ5Y2VkZDA2NzIiLCJlbWFpbCI6Inhib3hhbGw4MEBnbWFpbC5jb20iLCJleHBpcmVzIjoiMjAyNS0wOC0xOFQwNjoyMTowMS41MTdaIiwiaWF0IjoxNzUyOTA2MDYxfQ.uw6qSCKWKfI-cLlavehxRhiWqdqWG_NQzWHfnp5hZMQ`
const api = axios.create({

  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    "Authorization":`Bearer ${statiqueToken}`
  }
});

api.interceptors.request.use(
  async (config) => {

    if (statiqueToken) {
      config.headers.Authorization = `Bearer ${statiqueToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;