<template>
  <div class="form-container">
    <span class="square-circle"/>
    <span class="square-spread"/>
    <div class="box">
      <el-form :model="registerData">
        <h2>注册</h2>
        <div class="input-box">
          <input v-model="registerData.email" type="text" @keydown.enter="handleEnter('email')">
          <span v-show="registerData.email===''" class="label-text">邮箱</span>
          <span v-show="registerData.email!==''" class="exist-label-text">邮箱</span>
          <i class="input-background"/><i class="input-background-cover"/>
        </div>
        <div class="input-box">
          <input v-model="registerData.password" type="password" @keydown.enter="handleEnter('password')">
          <span v-show="registerData.password===''" class="label-text">密码</span>
          <span v-show="registerData.password!==''" class="exist-label-text">密码</span>
          <i class="input-background"/><i class="input-background-cover"/>
        </div>
        <div class="input-box">
          <input ref="confirmPasswordInput" v-model="registerData.confirmPassword" type="password"
                 @keydown.enter="handleEnter('confirmPassword')">
          <span v-show="registerData.confirmPassword===''" class="label-text">确认密码</span>
          <span v-show="registerData.confirmPassword!==''" class="exist-label-text">确认密码</span>
          <i class="input-background"/><i class="input-background-cover"/>
        </div>
        <div class="input-box">
          <input v-model="registerData.verificationCode" class="verification-code"
                 type="text" @keydown.enter="handleEnter('verificationCode')">
          <!--type="button"明确指出该按钮不是用来提交表单的，如果一个按钮位于表单中，且没有其他type为submit的按钮，那么该按钮会默认为表单提交按钮-->
          <button
              class="verification-code-button"
              type="button"
              @click="tryToSendCode(registerData.email)"
          >{{ buttonLabel }}
          </button>
          <span v-show="registerData.verificationCode===''" class="label-text">验证码</span>
          <span v-show="registerData.verificationCode!==''" class="exist-label-text">验证码</span>
          <i class="input-background verification-code"/><i class="input-background-cover verification-code"/>
        </div>
        <div class="links">
          <router-link class="router-link" to="/user/login">已有账号，去登录</router-link>
          <span class="confirmPassword-tip"/>
        </div>
        <div class="submit-button" @click="submitForm"/>
        <i class="default-background"/>
        <i class="fill-background"/>
        <div class="button-text">注册</div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {ElMessage} from "element-plus";
import {buttonLabel, initSendTimes, updateCooldown} from "@/utils/sendCodeCooldown.js";
import axios from "@/utils/axios.js"
import {tipMessageFromSingleResult} from "@/utils/messageHanding.js";
import {tryToSendCode} from "@/utils/sendCode.js";
import {useRouter} from "vue-router";

const router = useRouter();
const registerData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  isAllRight: false
})

const confirmPasswordInput = ref(null);
let confirmPasswordWatch = null;

function changeStyle(inputBox, isValidOrFocused) {
  const background = inputBox.querySelector('.input-background')
  const backgroundCover = inputBox.querySelector('.input-background-cover')

  if (isValidOrFocused) {
    //消失的时候快
    backgroundCover.style.transition = 'opacity 0.1s';
    backgroundCover.style.opacity = 0;
    setTimeout(() => {
      background.style.height = '40px';
    }, 100); // .input-background-cover 过渡动画的持续时间
  } else {
    background.style.height = '2px';
    setTimeout(() => {
      //显现的时候慢
      backgroundCover.style.transition = 'opacity 0.5s';
      backgroundCover.style.opacity = 1;
    }, 500); // .input-background 过渡动画的持续时间
  }
}

watchEffect(() => {
  registerData.isAllRight = registerData.email !== '' &&
      registerData.password !== '' &&
      registerData.confirmPassword !== '' &&
      registerData.verificationCode !== '';
});

//提交表单
async function submitForm() {
  if (!registerData.isAllRight) {
    ElMessage.error('请填写所有必填项');
    return;
  }

  try {
    const response = await axios.post('/lrf/register', {
      email: registerData.email,
      password: registerData.password,
      verificationCode: registerData.verificationCode
    });

    if (tipMessageFromSingleResult(response)) //如果注册成功，2秒后跳转到登录页面
      setTimeout(() => {
        router.push({name: 'login'})
      }, 2000)

  } catch (error) {
    ElMessage.error(`注册用户失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
}

function handleEnter(field) {
  if (registerData.isAllRight) {
    submitForm();
  } else {
    if (field === 'email' && !registerData.email) {
      focusNextInput('email');
    } else if (field === 'password' && !registerData.password) {
      focusNextInput('password');
    } else if (field === 'confirmPassword' && !registerData.confirmPassword) {
      focusNextInput('confirmPassword');
    } else if (field === 'verificationCode' && !registerData.verificationCode) {
      focusNextInput('verificationCode');
    }
  }
}

function focusNextInput(currentField) {
  if (currentField === 'email') {
    document.querySelector('input[type="password"]').focus();
  } else if (currentField === 'password') {
    confirmPasswordInput.value.focus();
  } else if (currentField === 'confirmPassword') {
    document.querySelector('input.verification-code').focus();
  } else if (currentField === 'verificationCode') {
    document.querySelector('input[type="text"]').focus();
  }
}

onMounted(() => {
  // 挂载完毕后才能进行元素获取
  document.querySelectorAll('.box .el-form .input-box').forEach(inputBox => {
    const input = inputBox.querySelector('input');
    input.addEventListener('focus', () => changeStyle(inputBox, true));
    input.addEventListener('blur', () => changeStyle(inputBox, false));
    input.addEventListener('invalid', () => changeStyle(inputBox, false));
    input.addEventListener('input', () => {
      if (input.checkValidity()) {
        changeStyle(inputBox, true);
      } else {
        changeStyle(inputBox, false);
      }
    });

    // 密码确认
    const confirmPasswordTip = document.querySelector('.confirmPassword-tip');

    confirmPasswordInput.value.addEventListener('focus', () => {
      confirmPasswordWatch = watch(() => registerData.confirmPassword, (newVal) => {
        confirmPasswordTip.textContent = newVal !== registerData.password ? '密码不一致' : '';
        // console.log('检测成功')
      });
    });

    confirmPasswordInput.value.addEventListener('blur', () => {
      if (confirmPasswordWatch) {
        confirmPasswordWatch = null;
      }
    });

    //更新发送验证码按钮冷却时间
    initSendTimes();
    updateCooldown();
  });
})
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  overflow: hidden; //隐藏溢出的动画效果
  position: relative; // 确保可以定位子元素
}

.square-circle, .square-spread {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 450px;
  height: 450px;
  border: 20px solid #a1eaff; // 淡蓝色边框
  transform: translate(-50%, -50%) rotate(45deg); // 初始顺时针旋转45度
}

.square-circle {
  z-index: 1; // 高于.square-spread
  animation: rotateAndScaleCircle 7s infinite; // 关键帧动画，时长5秒，无限循环
}

.square-spread {
  z-index: 0; // 最低
  animation: rotateAndScaleSpread 7s infinite; // 关键帧动画，时长5秒，无限循环
}

// .square-circle 的关键帧动画
@keyframes rotateAndScaleCircle {
  10% {
    transform: translate(-50%, -50%) rotate(-30deg);
  }
  30% {
    transform: translate(-50%, -50%) rotate(495deg);
    width: 450px;
    height: 450px;
  }
  35% {
    transform: translate(-50%, -50%) rotate(495deg);
    width: 500px;
    height: 500px;
  }
  60%, 100% {
    transform: translate(-50%, -50%) rotate(495deg);
    width: 450px;
    height: 450px;
  }
}

// .square-spread 的关键帧动画
@keyframes rotateAndScaleSpread {
  10% {
    transform: translate(-50%, -50%) rotate(-30deg);
  }
  30% {
    transform: translate(-50%, -50%) rotate(495deg);
    width: 450px;
    height: 450px;
  }
  35%, 100% {
    transform: translate(-50%, -50%) rotate(495deg);
    width: 1500px;
    height: 1500px;
  }
}

.box {
  position: relative;
  width: 380px;
  height: 580px;
  background-color: #fcfcfc;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  z-index: 2;
}

.box .el-form {
  position: absolute;
  inset: 4px;
  padding: 50px 40px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.box .el-form h2 {
  color: #1c1c1c;
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.1em; /*字体间距*/
}

.box .el-form .input-box {
  position: relative;
  width: 300px;
  margin-top: 35px;
}

.box .el-form .input-box input {
  position: relative;
  width: 100%;
  padding: 20px 10px 10px;
  background: transparent;
  outline: none;
  border: none;
  box-shadow: none;
  color: #23242a;
  font-size: 1em;
  letter-spacing: 0.05em;
  z-index: 3;
  transition: 0.5s;
}

.box .el-form .input-box .label-text {
  position: absolute;
  left: 0;
  padding: 20px 0 10px;
  pointer-events: none;
  color: #707070;
  font-size: 1em;
  letter-spacing: 0.05em;
  transition: 0.5s;
}

.box .el-form .input-box input:focus ~ .label-text {
  color: #181818;
  font-size: 0.75em;
  transform: translateY(-34px);
}

.box .el-form .input-box .exist-label-text {
  position: absolute;
  left: 0;
  padding: 20px 0 10px;
  pointer-events: none;
  letter-spacing: 0.05em;
  color: #181818;
  font-size: 0.75em;
  transform: translateY(-34px);
}

.box .el-form .input-box .input-background {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  transition: 0.5s;
  pointer-events: none;
}

.box .el-form .input-box .input-background-cover {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: black;
  overflow: hidden;
  pointer-events: none;
  /*该元素的transition属性是动态的，具体见逻辑代码*/
}

.box .el-form .input-box .verification-code {
  width: 60%;
}

.box .el-form .input-box .verification-code-button {
  background-color: #e7e7e7;
  width: 36%;
  height: 40px;
  margin-left: 10px;
  color: #505050;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.5s;
}

.box .el-form .input-box .verification-code-button:hover {
  background-color: #cecece;
}

.box .el-form .input-box .verification-code-button:active {
  opacity: 0.7;
}

.box .el-form .links {
  display: flex;
  justify-content: space-between;
}

.box .el-form .links .router-link {
  margin: 10px 0;
  font-size: 0.75em;
  color: #313131;
  text-decoration: none;
}

.box .el-form .links .confirmPassword-tip {
  margin: 10px 0;
  font-size: 0.75em;
  color: red;
  text-decoration: none;
}

.box .el-form .submit-button {
  border: none;
  outline: none;
  background-color: transparent;
  //background-color: red;
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
  height: 35px;
  margin-top: 10px;
  z-index: 1;
  //opacity: 0.2;
}

.box .el-form .button-text {
  position: absolute;
  left: 171px;
  bottom: 81px;
  font-size: 0.9em;
  cursor: pointer;
  user-select: none;
}

.box .el-form .default-background {
  position: absolute;
  top: 461px;
  width: 290px;
  height: 34px;
  background-color: white;
  border-radius: 4px;
}

.box .el-form .fill-background {
  position: absolute;
  top: 461px;
  width: 0;
  height: 34px;
  background-color: #f1f1f1;
  border-radius: 4px;
  transition: all 0.5s;
}

.box .el-form .submit-button:hover ~ .fill-background {
  width: 290px;
}

.box .el-form .submit-button:active ~ .fill-background {
  opacity: 0.5;
}
</style>