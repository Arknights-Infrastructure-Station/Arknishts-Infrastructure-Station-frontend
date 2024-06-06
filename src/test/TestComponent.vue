<script setup>

import RateGroup from "@/custom/MiniParts/RateGroup.vue";

const state=ref(0)
watch(state,()=>{
  console.log('state=',state.value)
})
</script>

<template>
  <rate-group v-model="state"/>
</template>

<style scoped lang="less">

</style>