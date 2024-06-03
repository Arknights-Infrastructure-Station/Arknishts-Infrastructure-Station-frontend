<script setup>
import {buttonLabel, initSendTimes, updateCooldown} from "@/utils/sendCodeCooldown.js";
import {ElMessage} from "element-plus";
import VerificationInput from "@/custom/Input/verificationInput.vue";
import UnderlineInput from "@/custom/Input/underlineInput.vue";
import operatorTable from "@/static/json/character_table_simple.json"
import axios from "@/utils/axios.js"
import {useRouter} from "vue-router";
import {tipMessage} from "@/utils/messageHanding.js";
import {cloneDeep} from "lodash";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import OperatorCards from "@/custom/setOperators/OperatorCards.vue";
import {tryToSendCode} from "@/utils/sendCode.js";
import {useData} from "@/store/globalData.js";

const router = useRouter()

const data = useData()

// 修改基本信息
const newUsername = ref('')

const chooseOperatorDialogVisible = ref(false);
const charIdForAvatar = ref([])
for (const key in operatorTable) {
  charIdForAvatar.value.push(operatorTable[key].charId) // charId用于获取干员头像
}

const chooseAvatar = ref('')

const cancelAvatar = () => {
  chooseOperatorDialogVisible.value = false
  chooseAvatar.value = ''
}

const confirmAvatar = async () => {
  chooseOperatorDialogVisible.value = false
}

const updateAvatarOrUsername = async () => {
  if (chooseAvatar.value !== '') {
    try {
      const response = await axios.put('/user/updateAvatar', chooseAvatar.value, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      tipMessage(response)
    } catch (error) {
      ElMessage.error(`头像更新失败: ${error.response?.data?.operateResult?.message || error.message}`);
    } finally {
      chooseAvatar.value = ''
    }
  }
  if (newUsername.value !== '') {
    try {
      const response = await axios.put('/user/updateUsername', newUsername.value, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      tipMessage(response)
    } catch (error) {
      ElMessage.error(`用户名更新失败: ${error.response?.data?.operateResult?.message || error.message}`);
    } finally {
      newUsername.value = ''
    }
  }
}

// 更新密码
const oldPassword = ref('')
const newPassword = ref('')

// 更新密码的方法
const updatePassword = async () => {
  try {
    const response = await axios.post('/user/updatePassword', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    });
    tipMessage(response)

    // 清空输入字段
    oldPassword.value = '';
    newPassword.value = '';
  } catch (error) {
    ElMessage.error(`密码更新失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
};

// 更新邮箱
const newEmail = ref('')
const verificationCode = ref('')
watch(() => verificationCode.value, () => {
  // console.log(`vc:${verificationCode.value}`)
})

// 更新邮箱的方法
const updateEmail = async () => {
  try {
    const response = await axios.put('/user/updateEmail', {
      newEmail: newEmail.value,
      verificationCode: verificationCode.value
    });
    tipMessage(response)
  } catch (error) {
    ElMessage.error(`更新邮箱失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
};

// 自定义干员养成练度和基建排布配置
// 创建备份
const operatorsBak = ref(cloneDeep(data.userInfo.operators));
const infrastructureBak = ref(cloneDeep(data.userInfo.infrastructure));

// 控制按钮显示的响应式引用
const showSaveOperatorsButton = ref(false);
const showSaveInfrastructureButton = ref(false);

// 监视 operators 和 infrastructure 的变化
watch(() => data.userInfo.operators, (newValue) => {
  showSaveOperatorsButton.value = JSON.stringify(newValue) !== JSON.stringify(operatorsBak.value);
}, {deep: true});

watch(() => data.userInfo.infrastructure, (newValue) => {
  showSaveInfrastructureButton.value = JSON.stringify(newValue) !== JSON.stringify(infrastructureBak.value);
}, {deep: true});

// 保存operators的方法
const saveOperators = async () => {
  try {
    const response = await axios.put('/user/updateOperators', data.userInfo.operators);
    // 更新备份
    operatorsBak.value = cloneDeep(data.userInfo.operators);

    tipMessage(response)
  } catch (error) {
    ElMessage.error(`保存操作失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
};

// 保存infrastructure的方法，同setInfrastructure组件
const saveInfrastructure = async () => {
  try {
    const response = await axios.put('/user/updateInfrastructure', data.userInfo.infrastructure);
    // 更新备份
    infrastructureBak.value = cloneDeep(data.userInfo.infrastructure);

    tipMessage(response)
  } catch (error) {
    ElMessage.error(`保存操作失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
};

onMounted(() => {
  initSendTimes()
  updateCooldown()
})
</script>

<template>
  <el-dialog
      v-model="chooseOperatorDialogVisible"
      title="头像选择"
      width="1500"
  >
    <div class="avatar-box">
      <div
          v-for="charId in charIdForAvatar"
          :key="charId"
          class="choose-avatar-wrap"
          :class="{'glow-effect': chooseAvatar === charId}"
          @click="chooseAvatar = charId">
        <div
            class="choose-avatar"
            :class="`bg-${charId}`"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelAvatar">取消选择</el-button>
        <el-button type="primary" @click="confirmAvatar">
          确认选择
        </el-button>
      </div>
    </template>
  </el-dialog>

  <div class="info-cards-container">
    <el-card class="part-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">用户信息一览</span>
        </div>
      </template>
      <!--头像-->
      <div class="base-info">
        <span>头像</span>
        <div class="user-avatar" :class="`bg-${data.userInfo.avatar}`"/>
      </div>
      <!--用户名-->
      <div class="base-info">
        <span>用户名</span>
        <div>{{ data.userInfo.username }}</div>
      </div>
      <!--绑定邮箱-->
      <div class="base-info">
        <span>绑定邮箱</span>
        <div>{{ data.userInfo.email }}</div>
      </div>
    </el-card>
    <el-card class="part-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">修改基本信息</span>
          <div class="flex-grow"/>
          <el-button
              :disabled="chooseAvatar === '' && newUsername === ''"
              @click="updateAvatarOrUsername"
          >确认修改
          </el-button>
        </div>

      </template>
      <div class="base-info">
        <el-button
            class="choose-avatar-button"
            style="width: 65%;"
            @click="chooseOperatorDialogVisible=true"
        >选择头像
        </el-button>
        <div
            class="user-avatar choose-avatar-position"
            :class="`bg-${chooseAvatar}`"
        />
      </div>
      <div class="base-info">
        <underline-input v-model="newUsername" placeholder="新用户名" type="text" style="margin-top: 10px"/>
      </div>
    </el-card>
    <el-card class="part-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">修改密码</span>
          <div class="flex-grow"/>
          <el-button
              :disabled="oldPassword === '' || newPassword === ''"
              @click="updatePassword"
          >确认修改
          </el-button>
        </div>
      </template>
      <underline-input v-model="oldPassword" placeholder="原密码" type="password" style="margin-top: 0"/>
      <underline-input v-model="newPassword" placeholder="新密码" type="password"/>
    </el-card>
    <el-card class="part-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">改绑邮箱</span>
          <div class="flex-grow"/>
          <el-button
              :disabled="newEmail === '' || verificationCode === ''"
              @click="updateEmail"
          >确认改绑
          </el-button>
        </div>
      </template>
      <underline-input v-model="newEmail" placeholder="新邮箱" type="text" style="margin-top: 5px"/>
      <div class="verification-code-box">
        <verification-input v-model="verificationCode"/>
        <el-button
            type="info"
            plain
            @click="tryToSendCode(newEmail)"
            :disabled="newEmail === ''"
        >{{ buttonLabel }}
        </el-button>
      </div>
    </el-card>
    <el-card class="custom-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">干员养成练度</span>
          <div class="flex-grow"/>
          <transition name="fade">
            <el-button v-if="showSaveOperatorsButton" @click="saveOperators">保存</el-button>
          </transition>
          <el-button
              @click="router.push({name:'setOperators'})"
          >自定义干员养成练度
          </el-button>
        </div>
      </template>
      <div class="operator-elite">
        <OperatorCards v-model="data.userInfo.operators" :edit-level="1"/>
      </div>

    </el-card>
    <el-card class="custom-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">基建排布配置</span>
          <div class="flex-grow"/>
          <transition name="fade">
            <el-button v-if="showSaveInfrastructureButton" @click="saveInfrastructure">保存</el-button>
          </transition>
          <el-button
              @click="router.push({name:'setInfrastructure'})"
          >自定义基建排布配置
          </el-button>
        </div>
      </template>
      <InfrastructureTable style="margin: auto;" v-model="data.userInfo.infrastructure" draggable/>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
/*消除下拉菜单的黑色边框*/
.el-dropdown:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset; /* 消除光标移动到下拉菜单上出现的黑色边框 */
}

.info-cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.custom-info {
  width: 92%;
}

.part-info {
  width: 22%;
  height: 220px;
}

.base-info {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 15px 0;
}

.title-text {
  font-weight: bold;
}

//用户头像
.user-avatar {
  transform: scale(.22);
  position: absolute;
  top: -80px;
  left: 170px;
  border-radius: 50%;
}

//选择头像的按钮
.choose-avatar-button {
  margin-top: -15px;
}

.choose-avatar-position {
  top: -89px;
  left: 150px;
}

//选择头像
.avatar-box {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.choose-avatar-wrap {
  position: relative;
  width: 40px;
  height: 40px;
  //background-color: red;
  border-radius: 50%;
}

.choose-avatar {
  position: absolute;
  transform: scale(.22);
  border-radius: 50%;
  top: -70px;
  left: -70px;
}

.glow-effect {
  box-shadow: 0 0 10px rgb(255, 177, 0);
  background-color: rgb(255, 177, 0);
}

//验证码盒子
.verification-code-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

/*干员精英化要求*/
.operator-elite {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  gap: 7px;
}

/* 添加淡入淡出动画样式 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>