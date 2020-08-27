import axios from "axios";
import store  from '../store'

const url = process.env.VUE_APP_WISP_API_URL || "//192.168.1.100:3000";

let api = axios.create({
    baseURL: url
});
api.interceptors.request.use(function (config) {
    // Do something before request is sent
    const token = store.state.userToken;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
export default api 