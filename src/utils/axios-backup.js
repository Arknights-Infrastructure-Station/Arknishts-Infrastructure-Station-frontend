import axios from 'axios';
import {useBackendInterface} from "@/store/globalBackendInterface.js";
import {getFromLocalStorage, saveToLocalStorage} from "@/utils/commonMethods.js";
import {useData} from "@/store/globalData.js";

const globalData = useData()
const backendInterfaceStartWith = useBackendInterface().backendInterfaceStartWith
const axiosInstance = axios.create({
    baseURL: backendInterfaceStartWith,
    timeout: 10000, //10秒超时时间
});

// 请求拦截器，直接存储带有Bearer前缀的token
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('ais_token');
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器，将token发往后端的时候，后端会负责去掉Bearer，前端直接发送就行
axiosInstance.interceptors.response.use(response => {
    let token = response.headers['Authorization'] || response.headers['authorization'];
    // console.log('tokenHeader:' + token)
    if (token) {
        localStorage.setItem('ais_token', token);
    }

    // 检查返回的响应体中是否包含特定的字段，并更新对应的 Pinia store
    const data = response.data;

    // 下面的字段是和后端Controller返回记录对应的
    if (data.userInfo) {
        saveToLocalStorage('userInfo', data.userInfo);
        globalData.userInfo = getFromLocalStorage('userInfo')
    }
    if (data.starList) {
        saveToLocalStorage('starList', data.starList);
        globalData.starList = getFromLocalStorage('starList')
    }
    if (data.staredWorkFileList) {
        saveToLocalStorage('staredWorkFileList', data.staredWorkFileList);
        globalData.staredWorkFileList = getFromLocalStorage('staredWorkFileList')
    }
    if (data.staredWorkFileListCount) {
        saveToLocalStorage('staredWorkFileListCount', data.staredWorkFileListCount);
        globalData.staredWorkFileListCount = getFromLocalStorage('staredWorkFileListCount')
    }
    if (data.workFileList) {
        saveToLocalStorage('workFileList', data.workFileList);
        globalData.workFileList = getFromLocalStorage('workFileList')
    }
    if (data.workFileListCount) {
        saveToLocalStorage('workFileListCount', data.workFileListCount);
        globalData.workFileListCount = getFromLocalStorage('workFileListCount')
    }
    if (data.postedWorkFileList) {
        saveToLocalStorage('postedWorkFileList', data.postedWorkFileList);
        globalData.postedWorkFileList = getFromLocalStorage('postedWorkFileList')
    }
    if (data.postedWorkFileListCount) {
        saveToLocalStorage('postedWorkFileListCount', data.postedWorkFileListCount);
        globalData.postedWorkFileListCount = getFromLocalStorage('postedWorkFileListCount')
    }
    if (data.stagingWorkFileList) {
        saveToLocalStorage('stagingWorkFileList', data.stagingWorkFileList);
        globalData.stagingWorkFileList = getFromLocalStorage('stagingWorkFileList')
    }
    if (data.stagingWorkFileListCount) {
        saveToLocalStorage('stagingWorkFileListCount', data.stagingWorkFileListCount);
        globalData.stagingWorkFileListCount = getFromLocalStorage('stagingWorkFileListCount')
    }
    if (data.recyclingWorkFileList) {
        saveToLocalStorage('recyclingWorkFileList', data.recyclingWorkFileList);
        globalData.recyclingWorkFileList = getFromLocalStorage('recyclingWorkFileList')
    }
    if (data.recyclingWorkFileListCount) {
        saveToLocalStorage('recyclingWorkFileListCount', data.recyclingWorkFileListCount);
        globalData.recyclingWorkFileListCount = getFromLocalStorage('recyclingWorkFileListCount')
    }

    return response;
}, error => {
    return Promise.reject(error);
});


// export default axiosInstance;
