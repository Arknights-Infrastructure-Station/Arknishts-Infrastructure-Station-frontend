<script setup>
import hljs from "highlight.js/lib/core";
import {useRouter} from "vue-router";
import {cloneDeep} from "lodash";
import TypeAndLayoutTags from "@/custom/MiniParts/TypeAndLayoutTags.vue";
import PureInfrastructureTable from "@/custom/setInfrastructure/PureInfrastructureTable.vue";
import {useData} from "@/store/globalData.js";
import {downloadWorkFile, getPngByKey, getStarListForUser, starWorkFile, unstarWorkFile} from "@/api/callEndpoint.js";
import {formatJSON} from "@/utils/commonMethods.js";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {useWorkFileScreenData} from "@/store/globalWorkFileScreenData.js";

const data = useData()
const workFileScreenData = useWorkFileScreenData()

// 查看作业细节
const workFileDetailVisible = ref(false);
const showFileContent = ref(false)
const workFileDetail = reactive({})

let originStarState = false //作业收藏状态备份，只有在收藏状态与备份状态不同时（用户做了修改），才调用收藏/取消收藏接口
const seeDetail = (row) => {
  Object.assign(workFileDetail, row)
  workFileDetailVisible.value = true

  //在抽屉被打开时，初始化该作业的收藏状态
  hasStar.value = data.starList.some(starRecord => starRecord.wid === workFileDetail.id)
  //备份该作业的收藏状态
  originStarState = hasStar.value
};
const codeBox = ref()
const drawerOpened = async () => {
  if (workFileDetail.storageType === 'text') {
    delete codeBox.value.dataset?.highlighted;
    hljs.highlightAll()
    codeBox.value.style.borderRadius = '4px'
    codeBox.value.style.border = '1px solid #bbbbbb'
    codeBox.value.style.marginTop = '-17px'
  } else if (workFileDetail.storageType === 'pictureKey') {
    workFileDetail.fileContent = await getPngByKey(workFileDetail.fileContent)
  }
}

//作业收藏
const isLogin = ref(false)
const hasStar = ref(false)
const router = useRouter()

//收藏作业按钮，提示文本，按钮颜色
const starButtonText = () => {
  if (isLogin.value) {
    if (hasStar.value) return '取消收藏'
    else return '收藏作业'
  } else return '先去登录'
}

const starButtonType = computed(() => {
  if (isLogin.value) {
    if (hasStar.value) return 'info'
    else return 'warning'
  } else return 'info'
})

//点击收藏按钮，取反收藏状态，如果未登录则跳转到登录页面
const starClick = () => {
  if (isLogin.value) {
    hasStar.value = !hasStar.value
  } else {
    router.push({name: 'login'})
  }
}

//抽屉关闭时，检测用户操作记录并尝试改变作业收藏状态
const changeStarState = async () => {
  if (originStarState !== hasStar.value) {
    if (hasStar.value) {
      await starWorkFile(workFileDetail.id)
    } else {
      await unstarWorkFile(workFileDetail.id)
    }
  }
}

//干员精英化要求降序排序
const eliteSort = (requestElite) => {
  let clonedArray = cloneDeep(requestElite);
  clonedArray.sort((a, b) => b.elite - a.elite);
  return clonedArray;
}


onMounted(async () => {
  isLogin.value = localStorage.getItem('ais_token') !== null //检测用户是否已登录

  //获取该用户的作业收藏列表
  await getStarListForUser(false)
})
</script>

<template>
  <!--回到顶部-->
  <el-backtop :bottom="100" :right="100"/>
  <div class="work-list-wrapper">
    <el-table
        :data="data.filteredWorkFileList"
        table-layout="auto"
        @row-click="seeDetail"
    >
      <el-table-column label="作业名称" prop="name"/>
      <el-table-column label="作业类型" prop="type"/>
      <el-table-column label="采用的基建布局" prop="layout"/>
      <el-table-column label="发布者" prop="author"/>
      <el-table-column label="发布日期" prop="releaseDate" sortable/>
      <el-table-column label="下载数" prop="downloadNumber" sortable/>
      <el-table-column label="收藏数" prop="starNumber" sortable/>
    </el-table>
  </div>
  <el-pagination
      v-model:current-page="workFileScreenData.currentPage"
      v-model:page-size="workFileScreenData.pageSize"
      :page-sizes="[10, 20, 40, 80]"
      :total="data.workFileListCount"
      background

      layout="total, sizes, prev, pager, next, jumper"
  />
  <el-drawer
      v-model="workFileDetailVisible"
      :with-header="false"
      direction="rtl"
      size="50%"
      @close="changeStarState"
      @opened="drawerOpened"
  >
    <div>
      <el-button
          class="drawer-header-button"
          plain
          type="info"
          @click="() => downloadWorkFile(workFileDetail)"
      >
        下载作业
      </el-button>
      <el-button
          :type="starButtonType"
          class="drawer-header-button"
          plain
          @click="starClick"
      >
        {{ starButtonText() }}
      </el-button>
    </div>
    <div style="display: flex;flex-wrap: wrap;align-items: center;gap: 10px;margin-bottom: -12px">
      <h2>{{ workFileDetail.name }}</h2>
      <TypeAndLayoutTags :layout="workFileDetail.layout" :type="workFileDetail.type"
                         style="transform: translateY(2px)"/>
    </div>

    <div class="drawer-mark-text-container">
      <span class="drawer-mark-text">{{ workFileDetail.author }}</span>
      <span class="drawer-mark-text">{{ workFileDetail.releaseDate }}</span>
      <span class="drawer-mark-text">
        <el-icon style="transform: translateY(2px)">
        <Download/>
      </el-icon>
      {{ workFileDetail.downloadNumber }}</span>
      <span class="drawer-mark-text">
        <el-icon style="transform: translateY(2px)">
        <Star/>
      </el-icon>
      {{ workFileDetail.starNumber }}</span>
    </div>
    <markdown-preview
        v-if="workFileDetail.description !== ''"
        :description="workFileDetail.description"
        class="drawer-markdown-container"
    />

    <table v-if="workFileDetail.fileRequest.requestElite?.length > 0"
           class="requestElite-table">
      <tr v-for="operatorRequest in eliteSort(workFileDetail.fileRequest.requestElite)" class="requestElite-tr">
        <td class="requestElite-td">
          <div :class="`bg-${operatorRequest.charId}`" class="operator-image"/>
        </td>
        <td class="requestElite-td">{{ operatorRequest.value }}</td>
        <td class="requestElite-td">
          <el-tag v-if="operatorRequest.elite===0" effect="light" type="info">精英零</el-tag>
          <el-tag v-if="operatorRequest.elite===1" effect="light" type="primary">精英一</el-tag>
          <el-tag v-if="operatorRequest.elite===2" effect="light" type="warning">精英二</el-tag>
        </td>
        <td class="requestElite-td">
          <span v-for="star in operatorRequest.rarity" :key="star" class="star">&#9733;</span>
        </td>
      </tr>
    </table>
    <div v-if="workFileDetail.fileRequest.requestInfrastructure?.length > 0" class="drawer-content-container">
      <PureInfrastructureTable
          v-model="workFileDetail.fileRequest.requestInfrastructure"
      />
    </div>
    <pre v-if="workFileDetail.storageType==='text'">
      <code ref="codeBox" class="language-json" style="margin-top: -25px;margin-bottom: -25px">
         {{ formatJSON(workFileDetail.fileContent) }}
      </code>
    </pre>
    <el-image
        v-else-if="workFileDetail.storageType==='pictureKey'"
        :preview-src-list="[workFileDetail.fileContent]"
        :src="workFileDetail.fileContent"
        fit="fill"
        style="margin-top: 10px"
    >
      <template #error>
        <div class="image-slot">
          <el-icon>
            <Picture/>
          </el-icon>
        </div>
      </template>
    </el-image>
  </el-drawer>
</template>

<style lang="scss" scoped>
.work-list-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

//头部按钮
.drawer-header-button {
  width: 48%;
}

//标注文本容器
.drawer-mark-text-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

//标注文本
.drawer-mark-text {
  color: grey;
}

//描述文本
.drawer-content-container {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fafafa;
}

//markdown文本
.drawer-markdown-container {
  margin-top: 10px;
}

.requestElite-table {
  width: 100%;
  margin-top: 10px;
  background-color: #fafafa;
  border: 1px solid #bbbbbb;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 4px; /* 设置表格的圆角 */
}

.requestElite-td {
  position: relative;
  height: 40px;

  border-bottom: 1px solid #b2b2b2;
  padding-inline: 10px;
}

.requestElite-tr:last-child .requestElite-td {
  border-bottom: none;
}

.requestElite-tr .requestElite-td:nth-child(1) {
  width: 35px;
}

.requestElite-tr .requestElite-td:nth-child(2) {
  text-align: center;
}

.requestElite-tr .requestElite-td:nth-child(3) {
  text-align: center;
}

.requestElite-tr .requestElite-td:nth-child(4) {
  text-align: center;
}

.operator-image {
  transform: scale(.21);
  position: absolute;
  top: -69px;
  left: -61px;
  border-radius: 50%;
}

//稀有度星星样式背景颜色
.star {
  color: #ffe719;
}

.star-box {
  display: flex;
  gap: 2px;
}
</style>