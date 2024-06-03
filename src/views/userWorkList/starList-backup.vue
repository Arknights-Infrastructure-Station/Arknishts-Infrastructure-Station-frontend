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
import {screenStaredWorkFileList, unstarWorkFile} from "@/api/callEndpoint.js";
import {formatJSON} from "@/utils/commonMethods.js";
import {cloneDeep} from "lodash";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {useStaredWorkFileSimpleSearch} from "@/store/simpleSearch/globalStaredWorkFileSimpleSearch.js";

const data = useData()
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

let timeoutId;

watch(() => staredWorkFileSimpleSearch, () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    copyStaredToSimpleSearch();
  }, 1000);
}, { deep: true });

const deleteStarRecord = async (wid) => {
  await unstarWorkFile(wid)
}

const starListBackup = reactive([]) //防止收藏列表更新时，误更新没有受到影响的元素

const update = async () => {
  await screenStaredWorkFileList(simpleSearch)
}

onMounted(async () => {
  await screenStaredWorkFileList(simpleSearch)

  // 遍历数组并添加属性
  data.starList.forEach(record => {
    if (!record.hasOwnProperty('showFileDetail')) {
      //是否展示作业细节
      record.showFileDetail = false;
    }
    if (!record.hasOwnProperty('showFileContent')) {
      //是否展示作业内容
      record.showFileContent = false;
    }
    if (!record.hasOwnProperty('isStar')) {
      //是否仍处于收藏状态
      record.isStar = true;
    }
  });

  Object.assign(starListBackup, data.starList) //进行备份
});

let isWatched = false
// 在onMounted执行完成后，watch会侦测到一次starListBackup被分配对象的事件，趁着这次事件添加上侦听器，这些侦听器只用添加一次
watch(starListBackup, () => {
  if (!isWatched) {
    // 监听每个对象的 showFileDetail 属性
    starListBackup.forEach((record, index) => {
      watch(() => record.showFileDetail, (newVal) => {
        if (newVal === false) {
          // 当 showFileDetail 被设置为 false 时，将 showFileContent 也设置为 false ，以免出现JSON数据高亮失败的情况
          starListBackup[index].showFileContent = false;
        }
      });

      //每次显示作业文件内容时，重新高亮JSON数据
      watch(() => record.showFileContent, (newVal) => {
        if (newVal === true) {
          hljs.highlightAll();
        }
      })

      isWatched = true //不再添加侦听器
    })
  }
})
watch(() => data.starList, () => {
  // 由于用户在收藏列表不可能收藏新的作业，所以在这里仅需考虑删除部分
  // 移除备份中在新列表中不存在的元素
  starListBackup.splice(0, starListBackup.length, ...cloneDeep(starListBackup.filter(backupRecord => data.starList.some(record => record.wid === backupRecord.wid))))
}, {deep: true});

onBeforeUnmount(async () => {
  //待取消收藏的作业数组
  const unstarWorkFiles = []

  // 组件卸载前删除添加的属性
  starListBackup.forEach(record => {
    delete record.showFileDetail;
    delete record.showFileContent;
    if (!record.isStar) {
      delete record.isStar
      unstarWorkFiles.push(record)
    }
    delete record.isStar
  });

  //批量调用取消收藏的方法
  if (unstarWorkFiles.length > 0) {
    try {
      const wids = unstarWorkFiles.map(file => file.wid);
      const response = await axios.post('/starRecord/unstarMultipleWorkFiles', wids);
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
                placeholder="作业名称、作业类型、作业布局、作业发布日期、作业描述、作业内容、作业精英化要求、作业存储类型"
                style="width: 700px"
                clearable
      />
      <el-pagination
          v-model:current-page="staredWorkFileSimpleSearch.currentPage"
          v-model:page-size="staredWorkFileSimpleSearch.pageSize"
          :page-sizes="[10, 20, 40, 80]"
          :total="data.staredWorkFileListCount"
          background

          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <div class="workFile-cards">
      <el-card v-for="(workFile,index) in data.staredWorkFileList" :key="index" class="workFile-card"
               shadow="hover">
        <div
            v-if="workFile!==undefined"
            class="workFile-header"
            @click="starRecord.showFileDetail=true"
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
            收藏日期：{{ starRecord.starDate }}
          </span>

          <!--占位-->
          <span/>

          <span>
            <el-icon><Download /></el-icon>
            <el-icon
                v-if="starRecord.isStar"
                color="gold"
                size="25"
                style="cursor: pointer"
                @click.stop="starRecord.isStar=false"
            ><StarFilled/>
            </el-icon>
            <el-icon
                v-if="!starRecord.isStar"
                size="25"
                style="cursor: pointer"
                @click.stop="starRecord.isStar=true"
            ><Star/>
            </el-icon>
          </span>
        </div>
        <div
            v-else
            class="none-workFile-header"
        >
          <span>
          这份作业被发布者放入回收箱了...也许还会再回来。<br>当这份作业被发布者恢复时，这条记录会重新显现；若这份作业被发布者确认删除了，那么这条记录也会自动被删除。
          </span>
          <div class="flex-grow"/>
          <el-button
              plain
              type="danger"
              @click="deleteStarRecord(starRecord.wid)"
          >
            删除这条收藏记录
          </el-button>
        </div>
        <el-collapse-transition>
          <div v-if="starRecord.showFileDetail">
            <el-divider
                v-if="starRecord.showFileDetail"
                border-style="dashed"
                style="user-select: none"
                @click="starRecord.showFileDetail=false"
            >
              点我收起
            </el-divider>

            <!--作业内容展示-->
            <span class="caption">作业文件内容</span>
            <el-switch
                v-model="starRecord.showFileContent"
                active-text="显示"
                inactive-text="不显示"
                inline-prompt
                style="margin-left: 10px"
            />
            <div>
              <transition name="slide">
                <div v-show="starRecord.showFileContent">
                  <pre v-if="workFile.storageType==='text'">
                  <code ref="codeBox" class="language-json" style="margin-top: -25px;margin-bottom: -25px">
                    {{ formatJSON(workFile.fileContent) }}
                  </code>
                </pre>
                  <el-image
                      v-else-if="workFile.storageType==='pictureKey'"
                      :preview-src-list="[workFile.fileContent]"
                      :src="workFile.fileContent"
                      fit="fill"
                      style="margin-top: 10px"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
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