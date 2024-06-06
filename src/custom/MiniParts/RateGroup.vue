<script setup>

const state = defineProps(
    {
      helpfulState: Object
    }
)

//选中样式刷新（点开抽屉初始化）
onMounted(() => {
  watchEffect(() => {
    if (!state.helpfulState.updated) { //检测到需要更新
      switch (state.helpfulState.score) {
        case -1: {
          checked1.value = false
          checked2.value = false
        }
          break;
        case 1: {
          checked1.value = true
          checked2.value = false
        }
          break;
        case 0: {
          checked2.value = true
          checked1.value = false
        }
          break;
      }
      state.helpfulState.updated = true //更新完毕
    }

    if (!checked1.value && !checked2.value)
      state.helpfulState.score = -1
    else if (checked1.value) {
      state.helpfulState.score = 1
    } else if (checked2.value) {
      state.helpfulState.score = 0
    }
  })
})

const checked1 = ref(false)
const checked2 = ref(false)

function onChange1(newState) {
  checked1.value = newState
  if (newState) checked2.value = false
}

function onChange2(newState) {
  checked2.value = newState
  if (newState) checked1.value = false
}


</script>

<template>
  <div class="tag-group">
    <el-check-tag
        :checked="checked1"
        type="success"
        @change="onChange1"
    >
      有帮助
    </el-check-tag>
    <el-check-tag
        :checked="checked2"
        type="danger"
        @change="onChange2"
    >
      没有帮助
    </el-check-tag>
  </div>

</template>

<style lang="scss" scoped>
.tag-group {
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: 5px;
}
</style>