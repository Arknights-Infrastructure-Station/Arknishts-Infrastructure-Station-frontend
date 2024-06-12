//发送验证码
import {handleSendCode} from "@/utils/sendCodeCooldown.js";
import axios from "@/utils/axios.js"
import {ElMessage} from "element-plus";
import {tipMessage} from "@/utils/messageHanding.js";

let email

async function sendVerificationCode() {
    try {
        await axios.get('/api/lrf/sendEmailVerificationCode', {
            params:{
                email: email,
            }
        });
    } catch (error) {
        ElMessage.error(`发送验证码失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

async function tryToSendCode(goalEmail) {
    if (goalEmail !== '') {
        email = goalEmail
        // console.log(email)
        handleSendCode(sendVerificationCode)
    } else ElMessage.info('请先填写邮箱')
}

export {tryToSendCode}