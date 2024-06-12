<script setup>
import operatorTable from '@/static/json/character_table_simple.json'
import {getEnProfessionArray, getNumRarityArray, getOwnerShipArr, intersectObjects} from "@/views/js/screen.js"
import Fuse from "fuse.js"
import {ElMessage} from "element-plus";
import axios from "@/utils/axios.js"
import {tipMessage} from "@/utils/messageHanding.js";
import {useData} from "@/store/globalData.js";

const data = useData()
//保存自定义干员练度
const saveCustomOperatorLevels = async () => {
  try {
    // Create a new array for storing operator data
    const customOperatorsData = operatorsLevelArr
        .filter(operator => operator.own) // Filter only owned operators
        .map(operator => ({
          charId: operator.charId,
          elite: operator.elite,
          value: operator.name, // 'name' as 'value'
          rarity: operator.rarity,
          profession: operator.profession
        }));

    // Sort the array by 'profession' in ascending order
    customOperatorsData.sort((a, b) => a.profession.localeCompare(b.profession));

    // Remove 'profession' property from each element
    customOperatorsData.forEach(operator => delete operator.profession);

    // Make a PUT request to the backend with JSON string
    const response = await axios.put('/api/user/updateOperators', customOperatorsData);

    tipMessage(response)
  } catch (error) {
    ElMessage.error(`保存自定义干员练度失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
  }
};

//配置Fuse模糊查询
const options = {
  includeScore: true, //将匹配值写入到结果中，供排序使用
  keys: ['name']
}

//遴选并存储公共数据
const operatorsLevelArr = []
for (let key in operatorTable) {
  if (operatorTable.hasOwnProperty(key)) {
    operatorsLevelArr.push(
        {
          "profession": operatorTable[key].profession,
          "charId": operatorTable[key].charId,
          "own": false,
          "elite": 0,
          "name": operatorTable[key].name,
          "rarity": operatorTable[key].rarity
        }
    )
  }
}

// 尝试读取用户数据并更新operatorsLevelArr
async function updateOperatorsWithUserData() {
  // console.log(data.userInfo.operators)

  if (data.userInfo.operators.length > 0) {
    operatorsLevelArr.forEach(operator => {
      const userOperator = data.userInfo.operators.find(uo => uo.charId === operator.charId);
      if (userOperator) {
        operator.elite = userOperator.elite;
        operator.own = true;
      }
    });
    ElMessage.success('用户数据加载成功')
  } else {
    ElMessage.warning('未加载到相应的用户数据')
  }
}

const dynamicOperatorsList = reactive([]) //根据筛选条件动态变化的干员列表

function dynamicChangeList() {
  dynamicOperatorsList.length = 0 //清空数组
  let tempArr1  //模糊筛选
  const tempArr2 = [] //多选栏筛选
  const enProArr = getEnProfessionArray(selectedProfessions)
  const numRarArr = getNumRarityArray(selectedRarities)
  const ownerShipArr = getOwnerShipArr(selectedOwnership.value)
  for (const o of operatorsLevelArr) {
    if (enProArr.includes(o.profession) && numRarArr.includes(o.rarity) && ownerShipArr.includes(o.own))
      tempArr2.push(o)
  }
  if (operatorSearch.value === '') //如果搜索栏为空，按多选栏筛选数据
    dynamicOperatorsList.push(...tempArr2)
  else {
    const fuse = new Fuse(operatorsLevelArr, options)
    const results = fuse.search(operatorSearch.value)
    // 筛选出 score 小于或等于 <某个精确程度> 的结果
    const filteredResults = results.filter(result => result.score <= 0.1)
    // 按 score 升序排序
    const sortedResults = filteredResults.sort((a, b) => a.score - b.score)
    // 排序之后，提取并返回每个结果中的 item
    tempArr1 = sortedResults.map(result => result.item)
    if (tempArr1.length !== 0) { //查询到了结果
      const finalResults = intersectObjects(tempArr1, tempArr2, 'name') //按name取交集，以tempArr1的升序顺序为主
      dynamicOperatorsList.push(...finalResults) //得到最终筛选结果
    }
  }
  // console.log(dynamicOperatorsList)
}

onMounted(() => {
  dynamicChangeList() //组件挂载时就调用一次
  updateOperatorsWithUserData() //尝试加载用户数据
})

//向父组件传递数据
const emit = defineEmits(['update-operatorsList']); //声明可以发出update-operatorsList事件
emit('update-operatorsList', dynamicOperatorsList)

//筛选栏数据
const professions = ref(['先锋', '近卫', '重装', '狙击', '术师', '医疗', '辅助', '特种'])
const rarities = ref(['1★', '2★', '3★', '4★', '5★', '6★'])
const ownerships = ref(['已拥有', '未拥有'])

const selectedProfessions = reactive([])
const selectedRarities = reactive([])
const selectedOwnership = ref('')

const operatorSearch = ref('')

const hoveredProfession = ref(null)
const hoveredRarity = ref(null)
const hoveredOwnership = ref(null)

function toggleSelection(type, item) {
  if (type === 'profession') {
    const index = selectedProfessions.indexOf(item)
    if (index > -1) {
      selectedProfessions.splice(index, 1)
    } else {
      selectedProfessions.push(item)
    }
  } else if (type === 'rarity') {
    const index = selectedRarities.indexOf(item)
    if (index > -1) {
      selectedRarities.splice(index, 1)
    } else {
      selectedRarities.push(item)
    }
  }
  dynamicChangeList()
}

//搜索栏处理
let timeout = null

function handleChange() {
  //当搜索栏内静置超过一段时间后，才更新动态干员列表
  clearTimeout(timeout)
  timeout = setTimeout(function () {
    dynamicChangeList()
  }, 200) // 设置0.2秒的延迟
}

/**
 * 当点击同一种拥有状态时，取消所有拥有状态（在筛选中就是选则所有拥有状态）
 */
function isOwner(ownership) {
  if (selectedOwnership.value !== ownership)
    selectedOwnership.value = ownership
  else selectedOwnership.value = ''
  dynamicChangeList()
}
</script>

<template>
  <div class="rank-container">
    <!--侦测鼠标悬停位置的透明图层（实际按钮）-->
    <div class="detect-hover" @click="saveCustomOperatorLevels"/>

    <!--保存按钮（壳子）-->
    <div class="save-button">
      保存
    </div>

    <!--筛选栏-->
    <div class="filter-bar">
      <!-- 职业 -->
      <div class="filter-row">
        <div class="filter-title">职业</div>
        <div class="filter-options">
          <div v-for="profession in professions" :key="profession"
               :class="{ selected: selectedProfessions.includes(profession), hover: hoveredProfession === profession }"
               class="filter-option"
               @click="toggleSelection('profession', profession)"
               @mouseenter="hoveredProfession = profession" @mouseleave="hoveredProfession = null">{{ profession }}
          </div>
        </div>
      </div>

      <!-- 稀有度 -->
      <div class="filter-row">
        <div class="filter-title">稀有度</div>
        <div class="filter-options">
          <div v-for="rarity in rarities" :key="rarity"
               :class="{ selected: selectedRarities.includes(rarity), hover: hoveredRarity === rarity }"
               class="filter-option"
               @click="toggleSelection('rarity', rarity)"
               @mouseenter="hoveredRarity = rarity" @mouseleave="hoveredRarity = null">{{ rarity }}
          </div>
        </div>
      </div>

      <!-- 是否拥有 -->
      <div class="filter-row">
        <div class="filter-title">是否拥有</div>
        <div class="filter-options">
          <div v-for="ownership in ownerships" :key="ownership"
               :class="{ selected: selectedOwnership === ownership, hover: hoveredOwnership === ownership }"
               class="filter-option"
               @click="isOwner(ownership)"
               @mouseenter="hoveredOwnership = ownership" @mouseleave="hoveredOwnership = null">{{ ownership }}
          </div>
        </div>
      </div>

      <!-- 搜索干员 -->
      <div class="filter-row">
        <div class="filter-title">搜索干员</div>
        <div class="filter-options">
          <el-input v-model="operatorSearch" class="search-box" placeholder="干员名称" type="text"
                    @input="handleChange()"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rank-container {
  position: relative;
  width: 97%;
  margin: 20px;
  //background-color: #1c1c1c;
  //background-color: transparent;
  //opacity: 0.5;
}

.filter-bar {
  width: calc(99% - 20px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr); /* 调整标题和选项之间的水平间距 */
  align-items: center;
  gap: 10px;
  box-shadow: 0 0 5px 0 lightgrey;
  border-radius: 3px;
  padding: 10px;
  transition: width 0.3s ease;
  background-color: white;
  //opacity: 0.5;
}

.save-button {
  position: absolute;
  z-index: -1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 黑体, serif;
  color: white;
  font-size: 20px;
  letter-spacing: 0.1em;
  border-radius: 3px;
  box-shadow: 0 0 5px 0 lightgrey;
  //top和bottom用于设置子元素的高度和父元素持平
  top: 0;
  bottom: 0;
  right: 0;
  //width: 10%;
  width: 120px;
  transition: 0.3s;
  animation: twinkle 2s;
  user-select: none;

  background-color: #00ec00;
  //opacity: 0.5;
}

@keyframes twinkle {
  20% {
    background-color: #00ec00;
  }
  40% {
    background-color: #ffe61c;
  }
  100% {
    background-color: #00ec00;
  }
}

.detect-hover {
  position: absolute;
  z-index: 1;
  background-color: transparent;
  border-radius: 3px;
  top: 0;
  bottom: 0;
  right: 0;
  //width: 10%;
  width: 120px;
  cursor: pointer;

  //opacity: 0.2;
}

.detect-hover:hover ~ .filter-bar {
  width: calc(99% - 135px);
}

.detect-hover:hover ~ .save-button {
  opacity: 0.7;
  animation: none;
}

.detect-hover:active ~ .save-button {
  background-color: #007000;
  opacity: 1;
  animation: none;
}

.filter-row {
  display: contents;
}

.filter-title {
  grid-column: 1;
  text-align: left;
  font-weight: bold;
  margin-right: 20px;
}

.filter-options {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-option {
  padding: 5px 10px;
  border: 1px solid lightgrey;
  border-radius: 3px; /* 设置圆角 */
  cursor: pointer; /* 光标在元素内显示“点击”手势 */
  background-color: #f0f0f0;
  color: #333;
  transition: background-color 0.3s, color 0.3s, transform 0.1s;
  user-select: none; /* 禁止文本选择 */
}

.filter-option:hover {
  background-color: #333;
  color: white;
}

.filter-option:active {
  background-color: #1c1c1c;
  color: white;
  transform: scale(.93);
}

.filter-option.selected {
  background-color: #e4f0ff;
  color: #3434ff;
  border-color: #8b8bff;
}

.filter-option.selected:hover {
  background-color: #0000ff;
  color: white;
}

.filter-option.selected:active {
  background-color: #000080;
  color: white;
  transform: scale(.96);
}

.search-box {
  width: 200px;
}
</style>