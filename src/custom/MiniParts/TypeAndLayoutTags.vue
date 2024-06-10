<script setup>
const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  layout: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    values: ['large', 'default', 'small'],
    default: 'default'
  }
})
</script>

<template>
<span>
<!--作业类型标签-->
<el-tag
    :size="size"
    v-if="type==='MAA'"
    type="primary"
>
  MAA
</el-tag>
<el-tag
    :size="size"
    v-else-if="type==='Mower'"
    type="success"
>
  Mower
</el-tag>
<el-tag
    :size="size"
    v-else
    type="info"
>
  其它
</el-tag>
  <!--作业布局标签-->
<el-tag
    :size="size"
    v-if="layout==='其它'"
    type="info"
>
  其它
</el-tag>
<el-tag
    :size="size"
    v-else
    type="warning"
>
  {{ layout }}
</el-tag>
</span>
</template>

<style scoped lang="scss">
span {
  display: inline-flex;
  gap: 5px;
}
</style>