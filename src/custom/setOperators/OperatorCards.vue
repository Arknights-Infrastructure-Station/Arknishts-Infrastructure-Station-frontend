<script setup>
const props = defineProps({
  editLevel: {
    type: Number,
    default: 0 //0（只读），1（可修改精英化阶段），2（可修改精英化阶段，可删除干员）
  }
})
const operators = defineModel({type: Object, required: true})

function removeOperator(charId) {
  operators.value = operators.value.filter(operator => operator.charId !== charId)
}
</script>

<template>
  <div class="cards-container">
    <!--可编辑-->
    <div v-if="editLevel >= 1" v-for="operator in operators" :key="operator.value">
      <el-dropdown>
        <el-card shadow="hover">
          <!-- 干员头像显示 -->
          <div class="operator-image" :class="`bg-${operator.charId}`"/>
          <span class="elite-text" :class="`elite-state${operator.elite}`">精英 {{
              operator.elite
            }}</span>
        </el-card>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="operator.elite=0">精英零</el-dropdown-item>
            <el-dropdown-item @click="operator.elite=1" v-if="operator.rarity>=3">精英一
            </el-dropdown-item>
            <el-dropdown-item @click="operator.elite=2" v-if="operator.rarity>=4">精英二
            </el-dropdown-item>
            <el-dropdown-item v-if="editLevel >= 2" @click="removeOperator(operator.charId)" divided>
                        <span class="elite-remove-text">
                          移除
                        </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!--不可编辑-->
    <el-card v-if="editLevel <= 0" v-for="operator in operators" :key="operator.value" shadow="never">
      <div class="operator-image" :class="`bg-${operator.charId}`"/>
      <span class="elite-text" :class="`elite-state${operator.elite}`">精英 {{
          operator.elite
        }}</span>
    </el-card>
  </div>

</template>

<style scoped lang="scss">
/*消除下拉菜单的黑色边框*/
.el-dropdown:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset; /* 消除光标移动到下拉菜单上出现的黑色边框 */
}

.cards-container{
  position: relative;
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.el-card {
  width: 67px;
  height: 90px;
}

.operator-image {
  transform: scale(.27);
  position: absolute;
  top: -57px;
  left: -56px;
}

.elite-text {
  font-weight: bold;
  position: absolute;
  top: 66px;
  left: 14px;
  user-select: none;
}

.elite-remove-text {
  color: red;
  text-align: center;
  width: 100%
}

.elite-state0 {
  color: #888888;
}

.elite-state1 {
  color: #444444;
}

.elite-state2 {
  color: #000000;
}
</style>