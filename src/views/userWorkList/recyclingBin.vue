<script setup>
import {Back, Delete} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import hljs from "highlight.js/lib/core";
import axios from "@/utils/axios.js"
import {tipMessage} from "@/utils/messageHanding.js";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import OperatorCards from "@/custom/setOperators/OperatorCards.vue";
import TypeAndLayoutTags from "@/custom/MiniParts/TypeAndLayoutTags.vue";
import {useData} from "@/store/globalData.js";
import {getWebPByKey, screenRecyclingWorkFileList} from "@/api/callEndpoint.js";
import {formatJSON} from "@/utils/commonMethods.js";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {useRecyclingWorkFileSimpleSearch} from "@/store/simpleSearch/globalRecyclingWorkFileSimpleSearch.js";

const data = useData()
const recyclingWorkFileSimpleSearch = useRecyclingWorkFileSimpleSearch();
const simpleSearch = reactive({
  wid: '',
  workQuery: '',
  currentPage: 1,
  pageSize: 10,
})

function copyRecyclingToSimpleSearch() {
  simpleSearch.workQuery = recyclingWorkFileSimpleSearch.workQuery;
  simpleSearch.currentPage = recyclingWorkFileSimpleSearch.currentPage;
  simpleSearch.pageSize = recyclingWorkFileSimpleSearch.pageSize;

  update()
}

let timeoutId;

watch(() => recyclingWorkFileSimpleSearch, () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    copyRecyclingToSimpleSearch();
  }, 1000);

  //清空已加载的图片存储数组
  images.value.length = 0
}, {deep: true});

//定位当前活动栏，以便实现图片懒加载
const activityBar = ref('')

const images = ref([]);

async function changeActivityBar(name) {
  if (typeof name === "number") {
    activityBar.value = name;
    const workFile = data.recyclingWorkFileList[name];

    if (!images.value[name]) {
      images.value[name] = {descriptionPictures: []};
    }

    if (!images.value[name].fileContent && workFile.storageType === 'pictureKey') {
      images.value[name].fileContent = await getWebPByKey(workFile.fileContent);
    }

    if (images.value[name].descriptionPictures.length === 0 && workFile.descriptionPictures && workFile.descriptionPictures.length > 0) {
      images.value[name].descriptionPictures = await Promise.all(
          workFile.descriptionPictures.map(picture => getWebPByKey(picture))
      );
    }
  }
}

const openDeleteConfirmDialog = ref(false);
const deleteGoal = ref(null)

// 恢复待回收的作业
const recoverRecyclingWorkFile = async (id) => {
  simpleSearch.wid = id
  try {
    const response = await axios.post('/api/recyclingWorkFile/recoverFromRecycling', simpleSearch);
    tipMessage(response)
  } catch (error) {
    ElMessage.error(`恢复待回收作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
  } finally {
    openDeleteConfirmDialog.value = false;
    deleteGoal.value = null;
  }
}

// 删除待回收的作业
function openDeleteDialog(recyclingWorkFile) {
  deleteGoal.value = recyclingWorkFile
  openDeleteConfirmDialog.value = true
}

const cancelDelete = () => {
  openDeleteConfirmDialog.value = false
  deleteGoal.value = null
}
const confirmDelete = async () => {
  simpleSearch.wid = deleteGoal.value.id
  try {
    const response = await axios.post('/api/recyclingWorkFile/deleteRecyclingWorkFile', simpleSearch);
    tipMessage(response)
  } catch (error) {
    ElMessage.error(`删除待回收作业失败: ${error.response?.data?.message || error.response?.data?.operateResult?.message || error.message}`);
  } finally {
    openDeleteConfirmDialog.value = false;
    deleteGoal.value = null;
  }
};

// 显示作业文件内容
const showFileContent = ref(false) //是否显示作业文件内容

// 每次显示作业文件内容时，重新高亮JSON数据
watch(showFileContent, (newValue) => {
  if (newValue === true) {
    hljs.highlightAll();
  }
});

const update = async () => {
  await screenRecyclingWorkFileList(simpleSearch)
}

onMounted(async () => {
  await screenRecyclingWorkFileList(simpleSearch)
});
</script>

<template>
  <el-dialog
      v-if="deleteGoal !== null"
      v-model="openDeleteConfirmDialog"
      draggable
      title="删除待回收作业"
  >
    <div class="dialog-content">
      您确定要删除 <b>{{ deleteGoal.name }}</b> 吗？
      <TypeAndLayoutTags :layout="deleteGoal.layout" :type="deleteGoal.type"/>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click.stop="cancelDelete">取消</el-button>
        <el-button type="danger" @click.stop="confirmDelete">
          确认删除
        </el-button>
      </div>
    </template>
  </el-dialog>

  <div class="page-content-container">
    <h3 style="text-align: center;margin-bottom: 35px">我的回收箱</h3>
    <div class="simple-search-bar">
      <el-input v-model="recyclingWorkFileSimpleSearch.workQuery"
                clearable
                placeholder="作业名称、作业类型、作业布局、作业发布日期、作业描述、作业内容、作业精英化要求、作业存储类型"
                style="width: 700px"
      />
      <el-pagination
          v-model:current-page="recyclingWorkFileSimpleSearch.currentPage"
          v-model:page-size="recyclingWorkFileSimpleSearch.pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="data.recyclingWorkFileListCount"
          background

          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <el-collapse accordion @change="changeActivityBar">
      <el-collapse-item v-for="(workFile,index) in data.recyclingWorkFileList" :name="index">
        <!--折叠栏标题-->
        <template #title>
          <div class="workFile-title">
            <!--作业名称-->
            <el-text truncated>{{ workFile.name }}</el-text>

            <TypeAndLayoutTags :layout="workFile.layout" :type="workFile.type"/>

            <span style="color: #e15050">该份作业将会在{{ workFile.clearTime }}被自动清除</span>
            <div class="flex-grow"/>
            <div class="operator-area">
              <el-tooltip content="从回收箱中恢复作业" effect="light" placement="bottom">
                <el-button
                    :icon="Back"
                    circle
                    plain
                    type="success"
                    @click.stop="recoverRecyclingWorkFile(workFile.id)"
                />
              </el-tooltip>
              <el-tooltip content="待回收的作业会被直接删除哦" effect="light" placement="bottom">
                <el-button
                    :icon="Delete"
                    circle
                    plain
                    type="danger"
                    @click.stop="openDeleteDialog(workFile)"
                />
              </el-tooltip>
            </div>
          </div>
        </template>

        <div class="workFile-content-container">
          <!--内容顶栏-->
          <div class="workFile-content-top">
            <span class="workFile-content-top-text">
              发布时间：{{ workFile.releaseDate }}
            </span>
            <span class="workFile-content-top-text">
              收藏数：{{ workFile.starNumber }}
            </span>
            <span class="workFile-content-top-text">
              下载数：{{ workFile.downloadNumber }}
            </span>
          </div>

          <!--作业内容展示-->
          <span class="caption">作业文件内容</span>
          <el-switch
              v-model="showFileContent"
              active-text="显示"
              inactive-text="不显示"
              inline-prompt
              style="margin-left: 10px"
          />
          <div>
            <transition name="slide">
              <div v-show="showFileContent">
                <pre v-if="workFile.storageType==='text'">
                  <code ref="codeBox" class="language-json" style="margin-top: -30px;margin-bottom: -30px">
                    {{ formatJSON(workFile.fileContent) }}
                  </code>
                </pre>
                <el-image
                    v-else-if="workFile.storageType==='pictureKey'&&index===activityBar"
                    :preview-src-list="[images[index].fileContent]"
                    :src="images[index].fileContent"
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
              </div>
            </transition>
          </div>


          <!--作业描述-->
          <div v-if="workFile.description!==''">
            <span class="caption">作业描述</span>
            <!--            <div class="workFile-content-description">-->
            <!--              {{ workFile.description }}-->
            <!--            </div>-->
            <markdown-preview
                :description="workFile.description"
                :vditorId="index.toString()"
                class="drawer-markdown-container"
            />
          </div>
          <div v-else class="none-caption" style="color: grey">无作业描述</div>

          <!--作业描述图片-->
          <div
              v-if="index===activityBar && images[index] && images[index].descriptionPictures && images[index].descriptionPictures.length > 0">
            <span class="caption">作业描述图片</span>
            <div class="description-pictures-container">
              <el-image
                  v-for="url in images[index].descriptionPictures"
                  :key="url"
                  :preview-src-list="images[index].descriptionPictures"
                  :src="url"
                  class="description-pictures"
                  fit="cover"
                  lazy
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <Picture/>
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>

          <!--干员精英化要求展示-->
          <div v-if="workFile.fileRequest.requestElite?.length > 0">
            <span class="caption">干员精英化要求</span>
            <div>
              <div class="display-box">
                <OperatorCards v-model="workFile.fileRequest.requestElite"/>
              </div>
            </div>
          </div>
          <div v-else class="none-caption" style="color: grey">无干员精英化要求</div>


          <!--基建布局等级要求展示-->
          <div v-if="workFile.fileRequest.requestInfrastructure?.length > 0">
            <span class="caption">基建布局等级要求</span>
            <div>
              <div class="display-box">
                <InfrastructureTable v-model="workFile.fileRequest.requestInfrastructure"/>
              </div>
            </div>
          </div>
          <div v-else class="none-caption" style="color: grey">无基建布局等级要求</div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.workFile-content-container {
}


.workFile-title {
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-left: 15px;
  white-space: nowrap;
}

.operator-area {
  display: flex;
  margin-right: 20px;
}

.workFile-content-top {
  width: 100%;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.workFile-content-top .workFile-content-top-text {
  color: grey;
}

.drawer-markdown-container {
  margin: 5px 0 10px 1px;
}

/*说明文字*/
.caption {
  position: relative;
  transform: translateY(15px);
  color: black;
  font-weight: bold;
  font-size: 15px;
}

.none-caption {
  color: grey;
  font-weight: bold;
}

/*作业文件内容进出动画*/
.slide-enter-active, .slide-leave-active {
  transition: transform 0.5s;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

.slide-enter-to, .slide-leave-from {
  transform: translateX(0);
}

/*干员精英化等级要求*/
.display-box {
  border: 1px solid #a1a1a1;
  border-radius: 5px;
  padding: 10px;
  display: inline-flex;
  gap: 7px;
  margin-bottom: 20px;
}

/*干员精英化要求*/
.el-card {
  width: 67px;
  height: 90px;
  position: relative;
}

.operator-image {
  transform: scale(.27);
  position: absolute;
  top: -57px;
  left: -56px;
}

.elite-text {
  font-weight: bold;
  position: absolute;
  top: 62px;
  left: 14px;
  user-select: none;
}

.elite-state0 {
  color: #888888;
}

.elite-state1 {
  color: #444444;
}

.elite-state2 {
  color: #000000;
}

/*基建布局等级要求*/
table {
  margin: 0;
  border-collapse: separate;
  border-spacing: 10px;
  border: none;
}

td {
  border: 1px solid black;
  border-radius: 2px;
  position: relative;
  height: 45px;
  text-align: center;
  vertical-align: middle;
  user-select: none;
}

.placeholder {
  border: none;
}

.nonDraggableFacilities-center, .nonDraggableFacilities-end {
  background-color: #a8a8a8;
}

.nonDraggableFacilities-center {
  width: 150px;
}

.nonDraggableFacilities-end {
  width: 100px;
}

.trading {
  background-color: lightskyblue;
}

.manufacture {
  background-color: lightyellow;
}

.power {
  background-color: lightgreen;
}

.trading, .manufacture, .power {
  width: 110px;
}
</style>