<script setup>
import Vditor from "vditor";

const props = defineProps({
  description: {
    type: String,
    default: ''
  }
})

const isLoading = ref(true)

let vditor = null

function initVditor() {
  const option = {
    value: props.description,
    mode: 'sv',
    preview: {
      delay: 1000,
      show: true
    },
    cache: {
      enable: false
    }
  }
  vditor = new Vditor('previewVditor', option)
  nextTick(() => isLoading.value = false)
}

onMounted(() => {
  initVditor()
})

</script>

<template>
  <div class="preview-vditor" v-loading="isLoading" element-loading-text="正在努力，请稍候...">
    <div id="previewVditor" class="vditor-preview"/>
  </div>
</template>

<style scoped lang="less">
:deep(.vditor-toolbar) {
  display: none;
}

:deep(.vditor-content) {
  .vditor-sv {
    display: none !important;
  }
}

:deep(.vditor-preview) {
  .vditor-preview__action {
    display: none;
  }

  .vditor-reset {
    //margin: 0;
    h1 {
      text-align: center;
    }
  }
}
</style>