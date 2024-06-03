import {ElMessage} from "element-plus";

/**
 * 提示成功和失败消息，适用于需要提示用户操作的地方
 */
function tipMessage(response) {
    let code = response.data.operateResult?.operateCode
    if (code === 200) {
        ElMessage.success(response.data.operateResult?.message)
        return true
    } else if (code > 200 && code < 300) {
        ElMessage.info(response.data.operateResult?.message)
        return true
    } else {
        ElMessage.error(response.data.operateResult?.message)
        return false
    }
}

/**
 * 仅提示失败消息，适用于默认调用接口的地方
 */
function tipErrorMessage(response) {
    let code = response.data.operateResult?.operateCode
    if (code >= 400 && code < 600) {
        ElMessage.error(response.data.operateResult?.message)
        return false
    }
}

function tipMessageFromSingleResult(response) {
    let code = response.data.operateCode
    if (code === 200) {
        ElMessage.success(response.data.message)
        return true
    } else if (code > 200 && code < 300) {
        ElMessage.info(response.data.message)
        return true
    } else {
        ElMessage.error(response.data.message)
        return false
    }
}

export {tipMessage, tipMessageFromSingleResult,tipErrorMessage}