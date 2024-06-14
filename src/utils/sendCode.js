//发送验证码
import {handleSendCode} from "@/utils/sendCodeCooldown.js";
import axios from "@/utils/axios.js"
import {ElMessage} from "element-plus";
import {isValidEmail} from "@/utils/check.js";

let email

async function sendVerificationCode() {
    try {
        await axios.get('/api/lrf/sendEmailVerificationCode', {
            params: {
                email: email,
            }
        });
    } catch (error) {
        ElMessage.error(`发送验证码失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
    }
}

async function tryToSendCode(goalEmail) {
    if (goalEmail !== '') {
        if (isValidEmail(goalEmail)) {
            email = goalEmail
            // console.log(email)
            handleSendCode(sendVerificationCode)
        } else ElMessage.info('请确保邮箱格式正确')

    } else ElMessage.info('请先填写邮箱')
}

export {tryToSendCode}