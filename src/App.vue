<template>
  <router-view/>
</template>
<script setup>
import {getFromLocalStorage} from "@/utils/commonMethods.js";
import {useData} from "@/store/globalData.js";
import {fieldsToSave} from "@/utils/axios.js";

const globalData = useData()
onMounted(() => {
  //在页面刷新时，重新加载所有数据
  fieldsToSave.forEach(field => {
    globalData[field] = getFromLocalStorage(field);
  });
})
</script>
