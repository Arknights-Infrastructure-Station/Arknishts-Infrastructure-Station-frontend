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
    'userRates',
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

const fieldsNeedConvert = [
    'staredWorkFileList',
    'workFileList',
    'postedWorkFileList',
    'stagingWorkFileList',
    'recyclingWorkFileList',
];

// 响应拦截器，将token发往后端的时候，后端会负责去掉Bearer，前端直接发送就行
axiosInstance.interceptors.response.use(response => {
    const globalData = useData();
    let token = response.headers['Authorization'];
    if (token) {
        localStorage.setItem('ais_token', token);
    }

    // 拦截存储
    const handleResponseData = (key) => {
        const fileList = response.data[key];
        if (fileList) {
            if (fieldsNeedConvert.includes(fileList)) {
                fileList.forEach(workFile => {
                    //将JSON格式的，作业描述图片数组字符串转换为实际数组
                    workFile.descriptionPictures = JSON.parse(workFile.descriptionPictures)
                })
            }
            saveToLocalStorage(key, fileList);
            globalData[key] = getFromLocalStorage(key);
        }
    };

    fieldsToSave.forEach(handleResponseData);

    return response;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
