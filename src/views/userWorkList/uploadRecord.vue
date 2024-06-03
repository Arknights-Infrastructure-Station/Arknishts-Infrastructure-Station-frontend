<script setup>
import hljs from "highlight.js/lib/core";
import {Delete, Edit} from "@element-plus/icons-vue";
import {useCreateOrEditWorkFileData} from "@/store/createOrEditWorkFileData.js";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import OperatorCards from "@/custom/setOperators/OperatorCards.vue";
import TypeAndLayoutTags from "@/custom/MiniParts/TypeAndLayoutTags.vue";
import {useData} from "@/store/globalData.js";
import {formatJSON} from "@/utils/commonMethods.js";
import axios from "@/utils/axios.js";
import {tipMessage} from "@/utils/messageHanding.js";
import {ElMessage} from "element-plus";
import {editState} from "@/static/state/editState.js";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {usePostedWorkFileSimpleSearch} from "@/store/simpleSearch/globalPostedWorkFileSimpleSearch.js";
import {getPngByKey, screenPostedWorkFileList} from "@/api/callEndpoint.js";

const data = useData()
const createOrEditWorkFileData = useCreateOrEditWorkFileData();
const postedWorkFileSimpleSearch = usePostedWorkFileSimpleSearch();
const simpleSearch = reactive({
  wid: '', //作业ID直接由用户通过按钮触发决定
  workQuery: '',
  currentPage: 1,
  pageSize: 10,
})

function copyPostedToSimpleSearch() {
  simpleSearch.workQuery = postedWorkFileSimpleSearch.workQuery;
  simpleSearch.currentPage = postedWorkFileSimpleSearch.currentPage;
  simpleSearch.pageSize = postedWorkFileSimpleSearch.pageSize;

  update()
}

let timeoutId;

watch(() => postedWorkFileSimpleSearch, () => {
  //延迟更新查询数据对象
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    copyPostedToSimpleSearch();
  }, 1000);

  //清空已加载的图片存储数组
  images.value.length = 0
}, {deep: true});

//定位当前活动栏，以便实现图片懒加载
const activityBar = ref('')

function changeActivityBar(name) {
  activityBar.value = name
  if (data.postedWorkFileList[name].storageType === 'pictureKey') {
    loadImage(name);
  }
}

const images = ref([]);

const loadImage = async (index) => {
  if (!images.value[index]) {
    images.value[index] = await getPngByKey(data.postedWorkFileList[index].fileContent);
  }
};

// 将已发布作业加入回收箱
const addWorkFileToRecycling = async (id) => {
  simpleSearch.wid = id
  try {
    const response = await axios.post('/recyclingWorkFile/addToRecycling', simpleSearch);
    tipMessage(response)
  } catch (error) {
    ElMessage.error(`将作业加入回收箱失败: ${error.response?.data?.operateResult?.message || error.message}`);
  }
}
const showFileContent = ref(false) //是否显示作业文件内容

//每次显示作业文件内容时，重新高亮JSON数据
watch(showFileContent, (newValue) => {
  if (newValue === true) {
    hljs.initHighlightingOnLoad();
  }
});

const update = async () => {
  await screenPostedWorkFileList(simpleSearch)
  // console.log(data.postedWorkFileListCount)
}

onMounted(async () => {
  await screenPostedWorkFileList(simpleSearch)
  // console.log(data.postedWorkFileList)
});
</script>

<template>
  <div class="page-content-container">
    <h3 style="text-align: center;margin-bottom: 35px">我发布的作业</h3>
    <div class="simple-search-bar">
      <el-input v-model="postedWorkFileSimpleSearch.workQuery"
                clearable
                placeholder="作业名称、作业类型、作业布局、作业发布日期、作业描述、作业内容、作业精英化要求、作业存储类型"
                style="width: 700px"
      />
      <el-pagination
          v-model:current-page="postedWorkFileSimpleSearch.currentPage"
          v-model:page-size="postedWorkFileSimpleSearch.pageSize"
          :page-sizes="[10, 20, 40, 80]"
          :total="data.postedWorkFileListCount"
          background

          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <el-collapse accordion @change="changeActivityBar">
      <el-collapse-item v-for="(workFile,index) in data.postedWorkFileList" :key="index" :name="index">
        <!--折叠栏标题-->
        <template #title>
          <div class="workFile-title">
            <!--作业名称-->
            {{ workFile.name }}

            <TypeAndLayoutTags :layout="workFile.layout" :type="workFile.type"/>

            <div class="flex-grow"/>
            <div class="operator-area">
              <el-tooltip content="编辑该作业" effect="light" placement="bottom">
                <el-button
                    :icon="Edit"
                    circle
                    plain
                    type="primary"
                    @click.stop="createOrEditWorkFileData.editWorkFile(workFile,editState.workFileEdit)"
                />
              </el-tooltip>
              <el-tooltip effect="light" placement="bottom">
                <template #content>
                  <span>将作业放入回收箱</span>
                  <br/>
                  <span>回收箱中的作业会在30天后被自动清除，在此期间可随时恢复或手动提前删除</span>
                </template>
                <el-button
                    :icon="Delete"
                    circle
                    plain
                    type="danger"
                    @click.stop="addWorkFileToRecycling(workFile.id)"
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
                    :preview-src-list="[images[index]]"
                    :src="images[index]"
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
                class="drawer-markdown-container"
            />
          </div>
          <div v-else class="none-caption" style="color: grey">无作业描述</div>

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
</style>