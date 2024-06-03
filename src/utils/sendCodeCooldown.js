// 验证码按钮
import {ElMessage} from "element-plus";

const sendCodeTimes = ref(0);
const cooldownRemaining = ref(0);
const COOLDOWN_PERIOD = 30; // 全局冷却时间，单位秒，防止刷新页面直接清零验证码发送冷却时间的情况

function initSendTimes() {
    /*
    每当一个新组件挂载时，调用这个方法，重置发送次数（决定发送文本）
    注意：应用该验证码的发送按钮不要出现在同一个页面，因为它们是同步的，所以出现在同一个页面会看起来很怪
     */
    sendCodeTimes.value = 0
}

function getCooldownEndTime() {
    const endTime = localStorage.getItem('cooldownEndTime');
    return endTime ? parseInt(endTime, 10) : 0;
}

function setCooldownEndTime(endTime) {
    localStorage.setItem('cooldownEndTime', endTime.toString());
}

function updateCooldown() {
    const currentTime = Date.now();
    const endTime = getCooldownEndTime();
    if (endTime > currentTime) {
        cooldownRemaining.value = Math.ceil((endTime - currentTime) / 1000);
        setTimeout(() => {
            updateCooldown();
        }, 1000);
    } else {
        cooldownRemaining.value = 0;
        localStorage.removeItem('cooldownEndTime');
    }
}

const buttonLabel = computed(() => {
    if (cooldownRemaining.value > 0) {
        return `剩余${cooldownRemaining.value}s`;
    }
    return sendCodeTimes.value > 0 ? '重新发送验证码' : '发送验证码';
});

function handleSendCode(callback) {
    if (cooldownRemaining.value > 0) {
        return; // 如果处于冷却期，不做任何操作
    }
    sendCodeTimes.value++ // 发送次数 +1
    const currentTime = Date.now();
    const endTime = currentTime + COOLDOWN_PERIOD * 1000;
    setCooldownEndTime(endTime);
    updateCooldown();

    // 调用传进来的方法
    if (callback && typeof callback === 'function') {
        ElMessage.info('正在尝试发送验证码')
        callback();
    }
}

export {buttonLabel, initSendTimes, handleSendCode, updateCooldown}