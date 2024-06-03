<template>
  <div class="center-layout">
    <!--作业筛选栏-->
    <work-screen/>
    <!--作业展示栏-->
    <work-display/>
  </div>
</template>

<script setup>
import WorkScreen from "@/views/workList/workScreen.vue";
import WorkDisplay from "@/views/workList/workDisplay.vue";
</script>

<style lang="scss" scoped>
.center-layout{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 30px;
}
</style>