<script setup>
import hljs from "highlight.js/lib/core";
import axios from "@/utils/axios.js"
import {StarFilled} from "@element-plus/icons-vue";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import OperatorCards from "@/custom/setOperators/OperatorCards.vue";
import TypeAndLayoutTags from "@/custom/MiniParts/TypeAndLayoutTags.vue";
import {tipMessage} from "@/utils/messageHanding.js";
import {ElMessage} from "element-plus";
import {useData} from "@/store/globalData.js";
import {
  downloadWorkFile,
  getStarListForUser,
  getWebPByKey,
  screenStaredWorkFileList,
  unstarWorkFile
} from "@/api/callEndpoint.js";
import {formatJSON} from "@/utils/commonMethods.js";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {useStaredWorkFileSimpleSearch} from "@/store/simpleSearch/globalStaredWorkFileSimpleSearch.js";

const data = useData()
// console.log(data.starList)
const staredWorkFileSimpleSearch = useStaredWorkFileSimpleSearch();
const simpleSearch = reactive({
  workQuery: '',
  currentPage: 1,
  pageSize: 10,
})

function copyStaredToSimpleSearch() {
  simpleSearch.workQuery = staredWorkFileSimpleSearch.workQuery;
  simpleSearch.currentPage = staredWorkFileSimpleSearch.currentPage;
  simpleSearch.pageSize = staredWorkFileSimpleSearch.pageSize;

  update()
}

/*
records和单独删除放入回收箱中的作业的记录不冲突
1.被放入回收箱中的作业对应的收藏记录无法被用户操作，而且在用户单独删除该条记录时，也会同步从records中移除该条记录，不会被卸载前的钩子重复使用
2.当被放入回收箱中的作业对应的收藏记录被删除时，新查询的staredWorkFileList不会包含被单独删除的作业
 */
const records = reactive([]); //记录所有已加载的收藏记录
watch(() => data.staredWorkFileList, (newList) => {
  newList.forEach((item) => {
    const existingRecord = records.find(record => record.id === item.id);
    if (existingRecord) {
      existingRecord.showFileDetail = false;
      existingRecord.showFileContent = false;
    } else {
      records.push({
        id: item.id,
        isStar: true,
        showFileDetail: false,
        showFileContent: false
      });
    }
  });
}, {deep: true});

//定义图片字符串Map
const webp = reactive(new Map())

watchEffect(async () => {
  for (const record of records) {
    if (!record.showFileDetail) {
      record.showFileContent = false;
    } else {
      const workFile = data.staredWorkFileList.find(workFile => workFile.id === record.id)
      if (!webp.has(workFile.id)) {
        webp.set(workFile.id, {})
      }
      const webpStore = webp.get(workFile.id);

      if (!webpStore.descriptionPictures
          && workFile.descriptionPictures !== null
          && workFile.descriptionPictures.length > 0) {
        webpStore.descriptionPictures = []
        for (let i = 0; i < workFile.descriptionPictures.length; i++) {
          webpStore.descriptionPictures[i] = await getWebPByKey(workFile.descriptionPictures[i])
        }
      }

      if (record.showFileContent) {
        /*
        当展示作业内容时，
        若作业存储类型为text，则重新高亮代码块；
        若作业存储类型为pictureKey，则调用后端接口获取图片key对应的value（基于Base64的图片字符串）
         */
        if (workFile.storageType === 'text')
          hljs.highlightAll();
        else if (workFile.storageType === 'pictureKey') {
          if (!webpStore.fileContent) {
            webpStore.fileContent = await getWebPByKey(workFile.fileContent)
          }
        }
      }
    }
  }
});

async function tryDownload(workFile) {
  if (workFile.storageType === 'pictureKey')
    workFile.fileContent = await getWebPByKey(workFile.fileContent)
  await downloadWorkFile(workFile)
}

let timeoutId;

watch(() => staredWorkFileSimpleSearch, () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    copyStaredToSimpleSearch();
  }, 1000);
}, {deep: true});

const deleteStarRecord = async (wid) => {
  await unstarWorkFile(wid)

  // 找到id为1的对象的索引
  const index = records.findIndex(record => record.id === wid);

  // 如果找到了该元素，删除它
  if (index !== -1) {
    records.splice(index, 1);
  }
}

const update = async () => {
  await screenStaredWorkFileList(simpleSearch)
  await getStarListForUser()
}

const recordsLoaded = ref(false)
onMounted(async () => {
  await screenStaredWorkFileList(simpleSearch)
  await getStarListForUser()

  //初始化数据
  data.staredWorkFileList.forEach((item) => {
    records.push({
      id: item.id,
      isStar: true,
      showFileDetail: false,
      showFileContent: false
    });
  })

  recordsLoaded.value = true
});

onBeforeUnmount(async () => {
  //待取消收藏的作业数组
  const unstarWorkFileWids = []

  records.forEach(record => {
    if (!record.isStar)
      unstarWorkFileWids.push(record.id)
  })
  //批量调用取消收藏的方法
  if (unstarWorkFileWids.length > 0) {
    try {
      const response = await axios.post('/api/starRecord/unstarMultipleWorkFiles', unstarWorkFileWids);
      tipMessage(response);
    } catch (error) {
      ElMessage.error(`批量取消收藏失败: ${error.message}`);
    }
  }
});
</script>

<template>
  <div class="page-content-container">
    <h3 style="text-align: center;margin-bottom: 35px">我收藏的作业</h3>
    <div class="simple-search-bar">
      <el-input v-model="staredWorkFileSimpleSearch.workQuery"
                clearable
                placeholder="作业名称、作业类型、作业布局、作业发布日期、作业描述、作业内容、作业精英化要求、作业存储类型"
                style="width: 700px"
      />
      <el-pagination
          v-model:current-page="staredWorkFileSimpleSearch.currentPage"
          v-model:page-size="staredWorkFileSimpleSearch.pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="data.staredWorkFileListCount"
          background

          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <div v-if="recordsLoaded" class="workFile-cards">
      <el-card v-for="(workFile,index) in data.staredWorkFileList" :key="index" class="workFile-card"
               shadow="hover">
        <div
            v-if="workFile.fileContent!==''"
            class="workFile-header"
            @click="records.find(record => record.id === workFile.id).showFileDetail=true"
        >
          <span>
            <!--作业名称-->
            {{ workFile.name }}
          </span>
          <TypeAndLayoutTags
              :layout="workFile.layout"
              :type="workFile.type"
          />
          <span>
          <!--作业作者-->
              {{ workFile.author }}
          </span>
          <span>
          <!--作业发布日期-->
            发布日期：{{ workFile.releaseDate }}
          </span>
          <span>
          <!--作业收藏日期-->
            收藏日期：{{ data.starList.find(starRecord => starRecord.wid === workFile.id).starDate }}
          </span>

          <!--占位-->
          <span/>

          <span>
            <el-icon
                size="25"
                style="cursor: pointer"
                @click.stop="() => tryDownload(workFile)">
              <Download/>
            </el-icon>
            <el-icon
                v-if="records.find(record => record.id === workFile.id).isStar"
                color="gold"
                size="25"
                style="cursor: pointer"
                @click.stop="records.find(record => record.id === workFile.id).isStar=false"
            ><StarFilled/>
            </el-icon>
            <el-icon
                v-if="!records.find(record => record.id === workFile.id).isStar"
                size="25"
                style="cursor: pointer"
                @click.stop="records.find(record => record.id === workFile.id).isStar=true"
            ><Star/>
            </el-icon>
          </span>
        </div>
        <div
            v-else
            class="none-workFile-header"
        >
          <span>
            {{ workFile.name }}
            <TypeAndLayoutTags
                :layout="workFile.layout"
                :type="workFile.type"
            /><br>
            这份作业被发布者放入回收箱了...也许还会再回来。<br>
            当这份作业被发布者恢复时，这条记录会重新显现；若这份作业被发布者确认删除了，那么这条记录也会自动被删除。
          </span>
          <div class="flex-grow"/>
          <el-button
              plain
              type="danger"
              @click="deleteStarRecord(workFile.id)"
          >
            删除这条收藏记录
          </el-button>
        </div>
        <el-collapse-transition>
          <div v-if="records.find(record => record.id === workFile.id).showFileDetail">
            <el-divider
                border-style="dashed"
                style="user-select: none"
                @click="records.find(record => record.id === workFile.id).showFileDetail=false"
            >
              点我收起
            </el-divider>

            <!--作业内容展示-->
            <span class="caption">作业文件内容</span>
            <el-switch
                v-model="records.find(record => record.id === workFile.id).showFileContent"
                active-text="显示"
                inactive-text="不显示"
                inline-prompt
                style="margin-left: 10px"
            />
            <div>
              <transition name="slide">
                <div v-show="records.find(record => record.id === workFile.id).showFileContent">
                  <pre v-if="workFile.storageType==='text'">
                    <code ref="codeBox" class="language-json" style="margin-top: -25px;margin-bottom: -25px">
                      {{ formatJSON(workFile.fileContent) }}
                    </code>
                  </pre>
                  <el-image
                      v-else-if="workFile.storageType==='pictureKey'"
                      :preview-src-list="[webp.get(workFile.id).fileContent]"
                      :src="webp.get(workFile.id).fileContent"
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
              <!--              <div class="workFile-content-description">-->
              <!--                {{ workFile.description }}-->
              <!--              </div>-->
              <markdown-preview
                  :description="workFile.description"
                  class="drawer-markdown-container"
              />
            </div>
            <div v-else class="none-caption" style="color: grey">无作业描述</div>

            <!--作业描述图片-->
            <div v-if="webp.get(workFile.id).descriptionPictures&&webp.get(workFile.id).descriptionPictures.length>0">
              <span class="caption">作业描述图片</span>
              <div class="description-pictures-container">
                <el-image
                    v-for="url in webp.get(workFile.id).descriptionPictures"
                    :key="url"
                    :preview-src-list="webp.get(workFile.id).descriptionPictures"
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
            <div
                v-if="workFile.fileRequest.requestElite?.length > 0">
              <span class="caption">干员精英化要求</span>
              <div>
                <div class="display-box">
                  <OperatorCards
                      v-model="workFile.fileRequest.requestElite"/>
                </div>
              </div>
            </div>
            <div v-else class="none-caption" style="color: grey">无干员精英化要求</div>

            <!--基建布局等级要求展示-->
            <div
                v-if="workFile.fileRequest.requestInfrastructure?.length > 0">
              <span class="caption">基建布局等级要求</span>
              <div>
                <div class="display-box">
                  <InfrastructureTable
                      v-model="workFile.fileRequest.requestInfrastructure"/>
                </div>
              </div>
            </div>
            <div v-else class="none-caption" style="color: grey">无基建布局等级要求</div>
          </div>
        </el-collapse-transition>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.workFile-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.workFile-card {
  transition: all 0.5s ease;
  width: 100%;
}

.workFile-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 3fr 3fr 1fr 1fr;
  align-items: center;
  justify-items: center;
}

.none-workFile-header {
  display: flex;
  align-items: center;
  justify-items: center;
  gap: 20px;
  color: grey;
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

/*作业描述*/
.drawer-markdown-container {
  margin: 5px 0 10px 1px;
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
.avatar-box {
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