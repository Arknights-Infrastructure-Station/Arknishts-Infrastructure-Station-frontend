import axios from 'axios';
import {useBackendInterface} from "@/store/globalBackendInterface.js";
import {getFromLocalStorage, saveToLocalStorage} from "@/utils/commonMethods.js";
import {useData} from "@/store/globalData.js";

// 创建 Axios 实例
const axiosInstance = axios.create({
    timeout: 30000, // 30秒超时时间
});

// 请求拦截器，直接存储带有Bearer前缀的token
axiosInstance.interceptors.request.use(config => {
    config.baseURL = useBackendInterface().backendInterfaceStartWith;

    const token = localStorage.getItem('ais_token');
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 以下字段和后端返回Record对应
const fieldsToSave = [
    'userInfo',
    'starList',
    'staredWorkFileList',
    'staredWorkFileListCount',
    'workFileList',
    'workFileListCount',
    'postedWorkFileList',
    'postedWorkFileListCount',
    'stagingWorkFileList',
    'stagingWorkFileListCount',
    'recyclingWorkFileList',
    'recyclingWorkFileListCount'
];
export {fieldsToSave}

// 响应拦截器，将token发往后端的时候，后端会负责去掉Bearer，前端直接发送就行
axiosInstance.interceptors.response.use(response => {
    const globalData = useData();
    let token = response.headers['Authorization'] || response.headers['authorization'];
    if (token) {
        localStorage.setItem('ais_token', token);
    }

    // 拦截存储
    const handleResponseData = (key) => {
        if (response.data[key]) {
            saveToLocalStorage(key, response.data[key]);
            globalData[key] = getFromLocalStorage(key);
        }
    };

    fieldsToSave.forEach(handleResponseData);

    return response;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
