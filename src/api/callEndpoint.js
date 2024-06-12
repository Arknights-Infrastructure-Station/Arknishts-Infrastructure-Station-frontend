import axios from "@/utils/axios.js";
import {tipErrorMessage, tipMessage} from "@/utils/messageHanding.js";
import {ElMessage} from "element-plus";
import {adaptMower} from "@/utils/adapter.js";

/**
 * 获取已发布作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的已发布作业列表
 */
export async function screenPostedWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/api/workFile/screenPostedWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取已发布作业列表失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取暂存作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的暂存作业列表
 */
export async function screenStagingWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/api/stagingWorkFile/screenStagingWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取暂存作业列表失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取待回收作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的待回收作业列表
 */
export async function screenRecyclingWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/api/recyclingWorkFile/screenRecyclingWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取待回收作业列表失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取收藏作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的收藏作业列表
 */
export async function screenStaredWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/api/starRecord/screenStaredWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取用户收藏列表失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取收藏作业记录
 * @returns {Promise<void>} 该用户的所有收藏记录
 */
export async function getStarListForUser(hasTip = true) {
    try {
        const response = await axios.get('/api/starRecord/getStarListForUser');
        if (hasTip) {
            tipErrorMessage(response)
        }
    } catch (error) {
        if (hasTip) {
            // 当前后端处理走的是这一条报错路线
            ElMessage.error(`获取用户收藏列表失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
        }
    }
}

/**
 * 收藏某个作业
 * @param id 作业id
 * @returns {Promise<void>} 操作结果
 */
export async function starWorkFile(id) {
    try {
        const response = await axios.post('/api/starRecord/starWorkFile', {wid: id});
        tipMessage(response)
    } catch (error) {
        ElMessage.error(`收藏作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 取消收藏某个作业
 * @param id 作业id
 * @returns {Promise<void>} 操作结果
 */
export async function unstarWorkFile(id) {
    try {
        const response = await axios.post('/api/starRecord/unstarWorkFile', {wid: id});
        tipMessage(response)
    } catch (error) {
        ElMessage.error(`取消收藏作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 根据键从对象存储服务中获取图片文件的数据URL
 *
 * @param {string} key 对象存储服务中的键
 * @returns {Promise<string>} 对应的图片文件的数据URL
 */
export async function getWebPByKey(key) {
    try {
        const response = await axios.get('/api/webp/${key}');
        return response.data;
    } catch (error) {
        ElMessage.error(`webp文件url获取失败: ${error}`);
    }
}

/**
 * 根据用户设置的筛选参数调用后端作业筛选接口
 *
 * @param workFileScreen
 * @returns {Promise<string>} 根据用户设置的筛选参数筛选后的作业列表
 */
export async function screenWorkFileList(workFileScreen) {
    try {
        const response = await axios.post('/api/workFile/screenWorkFileList', workFileScreen);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`筛选作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 根据用户设置的筛选参数调用后端作业筛选接口
 *
 * @param workFileScreen
 * @returns {Promise<string>} 根据用户设置的筛选参数筛选后的作业列表
 */
export async function rate(userRate) {
    try {
        const response = await axios.post('/api/score/rate', userRate);
        tipMessage(response)
    } catch (error) {
        ElMessage.error(`作业评分失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 根据用户设置的筛选参数调用后端作业筛选接口
 *
 * @param workFileScreen
 * @returns {Promise<string>} 根据用户设置的筛选参数筛选后的作业列表
 */
export async function getRateRecordsForUser() {
    try {
        const response = await axios.get('/api/score/getRateRecordsForUser');
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`筛选作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

export async function downloadWorkFile(workFileDetail) {
    let formattedWorkFileContent;
    let blob;
    let fileExtension = 'json';

    if (workFileDetail.storageType === 'pictureKey') {
        try {
            const base64Data = workFileDetail.fileContent;
            const base64Prefix = 'data:image/webp;base64,';
            const base64Index = base64Data.indexOf(base64Prefix);

            if (base64Index !== -1) {
                const pureBase64Data = base64Data.substring(base64Index + base64Prefix.length);
                const byteCharacters = atob(pureBase64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], {type: "image/webp"});
                fileExtension = 'webp';
            } else {
                ElMessage.error("无效的Base64字符串格式");
            }
        } catch (error) {
            ElMessage.error("图片解码错误: " + error.message);
            return;
        }
    } else {
        if (workFileDetail.type === 'Mower') {
            workFileDetail.fileContent = await adaptMower(workFileDetail.fileContent)
        }
        formattedWorkFileContent = JSON.stringify(JSON.parse(workFileDetail.fileContent));
        blob = new Blob([formattedWorkFileContent], {type: "application/json"});
    }

    try {
        await axios.post('/api/download/increaseDownloadCount', {
            wid: workFileDetail.id
        });
    } catch (error) {
        ElMessage.error("作业下载记录请求错误: " + error.message);
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workFileDetail.name}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
