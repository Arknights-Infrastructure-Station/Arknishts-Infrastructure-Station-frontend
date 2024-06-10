<script setup>
import {onMounted, ref} from 'vue';
import Vditor from 'vditor';
import {useCreateOrEditWorkFileData} from "@/store/createOrEditWorkFileData.js";

const createOrEditWorkFileData = useCreateOrEditWorkFileData();

let vditor = null; //定义vditor变量
/*
定义加载变量
如果transferWorkFile.description为空字符串，那么意味着作业上传/编辑页面处于create状态或作业编辑传输数据中的作业描述为空，如此便不需要载入了；
反之，则意味着作业上传/编辑页面一定处于某个edit状态，且传输数据中的作业描述不为空，那么就需要定时监视器负责描述载入。
 */
let ready = createOrEditWorkFileData.transferWorkFile.description === '';

const vditorData = defineModel()

const stopWatcher = watch(() => vditorData.value, () => {
  // console.log('试图载入');

  const interval = setInterval(() => {
    if (ready) {
      // console.log('载入完成');
      vditor.setValue(vditorData.value);
      clearInterval(interval);
      stopWatcher();
    }
  }, 100); // 每100毫秒检查一次vditor是否初始化完毕
});

const isLoading = ref(true);

const initVditor = () => {
  const options = {
    height: '50%',
    weight: '50%',
    toolbar: [
      "headings",
      "bold",
      "italic",
      "strike",
      "link",
      "|",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "table",
      "|",
      "quote",
      "line",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "undo",
      "redo",
      "|",
      "fullscreen",
      "edit-mode",
      {
        name: "more",
        toolbar: [
          "both",
          "code-theme",
          "content-theme",
          "export",
          "outline",
          "preview",
          "help",
        ],
      },
    ],
    cache: {
      enable: false
    },
    mode: 'sv',
    preview: {
      delay: 1000,
      show: true
    },
    counter: {
      enable: true,
      max: 2000,
      type: 'markdown'
    },
    input: updateDescriptionData,
    value: vditorData.value
  };
  vditor = new Vditor('vditor', options);
  nextTick(() => {
    isLoading.value = false;
    ready = true
  });
};

function updateDescriptionData() {
  vditorData.value = vditor.getValue()
  // console.log('vditorData:' + vditorData.value)
}

onMounted(() => {
  initVditor();
});
</script>

<template>
  <div v-loading="isLoading" class="vditor-wrapper" element-loading-text="正在努力，请稍候...">
    <div id="vditor" class="vditor"/>
  </div>
</template>

<style lang="less" scoped>
:deep(.vditor-preview__action) {
  display: none;
}
</style>