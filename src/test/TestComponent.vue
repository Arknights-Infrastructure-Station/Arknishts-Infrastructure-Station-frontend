<script setup>

import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";

const text = ref('123')
watch(() => text.value, () => {
  console.log(text.value)
})
</script>

<template>
  <markdown-editor v-model="text"/>
  <markdown-preview description="321"/>
</template>

<style scoped lang="less">

</style>