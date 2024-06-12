<template>
  <InfrastructureTable style="margin: auto;" v-model="tableData" :ratio="2" draggable/>

  <div ref="fixedOperatorBar" class="fixed-operator-bar">
    <div>
      <el-button type="primary" :icon="Refresh" @click="reset" circle/>
    </div>
    <div>
      <el-button type="success" :icon="Check" @click="saveInfrastructure" circle/>
    </div>
  </div>
</template>

<script setup>
import {ElMessage} from "element-plus";
import {Check, Refresh} from "@element-plus/icons-vue";
import axios from "@/utils/axios.js";
import {tipMessage} from "@/utils/messageHanding.js";
import {cloneDeep} from "lodash";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import {getFromLocalStorage} from "@/utils/commonMethods.js";
import {useData} from "@/store/globalData.js";

const data = useData()

function reset() {
  tableData.value = cloneDeep(bakData); //深拷贝
  ElMessage({
    message: '已重置',
  })
}

//
async function saveInfrastructure() {
  try {
    const response = await axios.put('/api/user/updateInfrastructure', tableData.value);
    tipMessage(response)
  } catch (error) {
    ElMessage.error(`保存操作失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
  }
}

const tableData = ref([
  {name: 'central', level: 5},
  {name: 'meeting', level: 3},
  {name: 'factory', level: 3},
  {name: 'contact', level: 3},
  {name: 'training', level: 3},

  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'manufacture', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5}
])

let bakData = [
  {name: 'central', level: 5},
  {name: 'meeting', level: 3},
  {name: 'factory', level: 3},
  {name: 'contact', level: 3},
  {name: 'training', level: 3},

  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'manufacture', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5}
]

// 动态适配操作栏高度
const fixedOperatorBar = ref(null);
const adjustNavPosition = () => {
  if (fixedOperatorBar.value) {
    const navHeight = fixedOperatorBar.value.offsetHeight;
    const windowHeight = window.innerHeight;
    const topOffset = (windowHeight - navHeight) / 2;
    fixedOperatorBar.value.style.top = `${topOffset}px`;
  }
};

async function loadUserInfrastructureData() {
  // 尝试加载用户数据
  if (data.userInfo.infrastructure.length > 0) {
    tableData.value = data.userInfo.infrastructure;
    bakData = data.userInfo.infrastructure
    ElMessage.success('用户数据加载成功')
  } else {
    ElMessage.warning('未加载到相应的用户数据')
  }
}

onMounted(() => {
  loadUserInfrastructureData()

  nextTick().then(() => {
    adjustNavPosition(); //确保该函数在所有DOM更新完成后才被调用
  });
  window.addEventListener('resize', adjustNavPosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustNavPosition);
});

</script>

<style scoped>
/*设置操作栏*/
.fixed-operator-bar {
  position: fixed;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  background-color: #ffffff;
  border: 1px solid #797979;
  border-radius: 3px;
  padding: 10px;
  transform: translateX(5%); /* 遮住右边框 */
}
</style>