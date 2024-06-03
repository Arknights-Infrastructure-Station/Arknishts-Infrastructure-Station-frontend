<template>
  <rank @update-operatorsList="handleOperatorsList"/>
  <operator-list :operatorsList="operatorsList.list"/>
</template>

<script setup>
import Rank from "@/components/setOperators/Rank.vue";
import OperatorList from "@/components/setOperators/OperatorList.vue";
//动态干员列表，数据中转
const operatorsList = reactive({list: []});

function handleOperatorsList(newList) { //利用Rank触发的事件执行handleOperatorsList，并使用形参列表接受传过来的数据
  operatorsList.list = newList;
}
</script>

<style lang="scss" scoped>

</style>