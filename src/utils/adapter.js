import axios from "@/utils/axios.js";
import {tipMessageFromSingleResult} from "@/utils/messageHanding.js";
import {ElMessage} from "element-plus";
import {getUserInfrastructureForMower} from "@/utils/infrastructure.js";

async function adaptMower(source) {
    let userInfrastructure = getUserInfrastructureForMower()
    try {
        const response = await axios.post('/adapter/getAdaptedMower', {
            source: source,
            require: userInfrastructure
        })
        source = response.data.result
        tipMessageFromSingleResult(response)
    } catch (e) {
        ElMessage.error('尝试适配失败：' + e.message)
    }
    return source
}

export {adaptMower}