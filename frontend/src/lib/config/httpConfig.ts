import axios from "axios";
import { getAccessToken } from "./tokenStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const $api = axios.create({
    baseURL,
    params: {},
    withCredentials: true,
})

$api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { $api };
