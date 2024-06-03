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
        const response = await axios.post('/workFile/screenPostedWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取已发布作业列表失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取暂存作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的暂存作业列表
 */
export async function screenStagingWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/stagingWorkFile/screenStagingWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取暂存作业列表失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取待回收作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的待回收作业列表
 */
export async function screenRecyclingWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/recyclingWorkFile/screenRecyclingWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取待回收作业列表失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取收藏作业列表
 * @param workFileSimpleSearch 用户设置的作业检索数据对象
 * @returns {Promise<void>} 符合要求的收藏作业列表
 */
export async function screenStaredWorkFileList(workFileSimpleSearch) {
    try {
        const response = await axios.post('/starRecord/screenStaredWorkFileList', workFileSimpleSearch);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`获取用户收藏列表失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 获取收藏作业记录
 * @returns {Promise<void>} 该用户的所有收藏记录
 */
export async function getStarListForUser(hasTip = true) {
    try {
        const response = await axios.get('/starRecord/getStarListForUser');
        if (hasTip) {
            tipErrorMessage(response)
        }
    } catch (error) {
        if (hasTip) {
            // 当前后端处理走的是这一条报错路线
            ElMessage.error(`获取用户收藏列表失败: ${error.response?.data?.operateResult?.message || error.message}`);
        }
    }
}

/**
 * 收藏某个作业
 * @param wid 作业id
 * @returns {Promise<void>} 操作结果
 */
export async function starWorkFile(wid) {
    try {
        const response = await axios.post('/starRecord/starWorkFile', wid);
        tipMessage(response)
    } catch (error) {
        ElMessage.error(`收藏作业失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 取消收藏某个作业
 * @param wid 作业id
 * @returns {Promise<void>} 操作结果
 */
export async function unstarWorkFile(wid) {
    try {
        const response = await axios.post('/starRecord/unstarWorkFile', wid);
        tipMessage(response)
    } catch (error) {
        ElMessage.error(`取消收藏作业失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

/**
 * 根据键从对象存储服务中获取PNG文件的数据URL
 *
 * @param {string} key 对象存储服务中的键
 * @returns {Promise<string>} 对应的PNG文件的数据URL
 */
export async function getPngByKey(key) {
    try {
        const response = await axios.get(`/api/png/${key}`);
        return response.data;
    } catch (error) {
        ElMessage.error(`png文件url获取失败: ${error}`);
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
        const response = await axios.post(`/workFile/screenWorkFileList`, workFileScreen);
        tipErrorMessage(response)
    } catch (error) {
        ElMessage.error(`筛选作业失败: ${error.response?.data?.operateResult?.message || error.message}`);
    }
}

export async function downloadWorkFile(workFileDetail) {
    let formattedWorkFileContent;
    let blob;
    let fileExtension = 'json';

    if (workFileDetail.type === 'Mower') {
        if (workFileDetail.storageType === 'pictureKey') {
            try {
                const base64Data = workFileDetail.fileContent;
                const base64Prefix = 'data:image/png;base64,';
                const base64Index = base64Data.indexOf(base64Prefix);

                if (base64Index !== -1) {
                    const pureBase64Data = base64Data.substring(base64Index + base64Prefix.length);
                    const byteCharacters = atob(pureBase64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    blob = new Blob([byteArray], {type: "image/png"});
                    fileExtension = 'png';
                } else {
                    throw new Error("Invalid Base64 string format.");
                }
            } catch (error) {
                ElMessage.error("图片解码错误: " + error.message);
                return;
            }
        } else {
            formattedWorkFileContent = JSON.stringify(JSON.parse(await adaptMower(workFileDetail.fileContent)));
            blob = new Blob([formattedWorkFileContent], {type: "application/json"});
        }
    } else {
        formattedWorkFileContent = JSON.stringify(JSON.parse(workFileDetail.fileContent));
        blob = new Blob([formattedWorkFileContent], {type: "application/json"});
    }

    try {
        await axios.post('/download/increaseDownloadCount', workFileDetail.id);
    } catch (error) {
        ElMessage.error("作业解析错误: " + error.message);
        return;
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
