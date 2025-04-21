import axios from "axios";
import { env } from "../env";

// Instância Axios configurada
export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para Authorization (Bearer Token)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }
  return config;
});

// Fetcher genérico para React Query
export const fetcher = async <T = unknown>(url: string) => {
  const response = await axiosClient.get<T>(url);
  return response.data;
};
