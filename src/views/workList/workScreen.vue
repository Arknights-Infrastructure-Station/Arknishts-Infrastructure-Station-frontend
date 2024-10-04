<script setup>
import {useData} from "@/store/globalData.js";
import {screenWorkFileList} from "@/api/callEndpoint.js";
import {useWorkFileScreenData} from "@/store/globalWorkFileScreenData.js";
import {cloneDeep} from "lodash";
import {ElMessage} from "element-plus";
import {useRefreshFlag} from "@/store/globalRefreshFlag.js";

const data = useData()
const workFileScreenData = useWorkFileScreenData()
const refreshFlag = useRefreshFlag()

const types = ['全部', 'MAA', 'Mower'];
const layouts = ['全部', '243', '153', '333', '252', '342', '其它'];
const sortType = ['发布时间', '评分']; //排序依据
const orderType = ['降序', '升序']; //排序方式

const dateShortcuts = [
  {
    text: '一周内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: '一个月内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    }
  },
  {
    text: '三个月内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    }
  },
  {
    text: '一年内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      return [start, end];
    }
  }
];

// 筛选作业文件
const filterWorkFiles = () => {
  data.filteredWorkFileList = cloneDeep(data.workFileList);
  // console.log(data.filteredWorkFileList)
  data.filteredWorkFileList = data.filteredWorkFileList.filter((workFile) => {
    // // 按类型筛选
    // if (workFileScreenData.type !== '全部' && workFile.type !== workFileScreenData.type) {
    //   return false;
    // }
    //
    // // 按基建布局筛选
    // if (workFileScreenData.layout !== '全部' && workFile.layout !== workFileScreenData.layout) {
    //   return false;
    // }
    //
    // // 按发布日期筛选
    // // 当使用el-date-picker的clearable去清除其中的数据的时候，该数据会被转换为null，而不是一个空数组，所以需要提前判断以防出错
    // if (Array.isArray(workFileScreenData.dateRange) && workFileScreenData.dateRange.length === 2) {
    //   const startDate = workFileScreenData.dateRange[0];
    //   const endDate = workFileScreenData.dateRange[1];
    //   const workFileDate = parseDate(workFile.releaseDate);
    //   if (workFileDate < startDate || workFileDate > endDate) {
    //     return false;
    //   }
    // }

    if (workFileScreenData.isEnableAdapter) { //如果用户开启了自定义适配模式
      if (data.userInfo) {
        const {operators, infrastructure} = data.userInfo;
        if (operators.length === 0 || infrastructure.length === 0) {
          ElMessage.error('在个人养成练度或个人基建排布配置未设定的情况下，无法开启自定义适配哦')
          workFileScreenData.isEnableAdapter = false
        } else {
          // 对比 operators 和 requestElite
          /*
          若在“operators和fileRequest.requestElite”的对比中找到了charId相同的对象，则对比这两个对象的elite属性的值是否相等，若不相等，该作业不通过。
           */
          if (workFile.fileRequest && workFile.fileRequest.requestElite) {
            for (const request of workFile.fileRequest.requestElite) {
              const operator = operators.find(op => op.charId === request.charId);
              if (!operator || operator.elite !== request.elite) {
                return false;
              }
            }
          }

          // 对比 infrastructure 和 requestInfrastructure
          /*
          若在“infrastructure和requestInfrastructure”的对比中发现它们的设施数量或设施等级不一致，该作业不通过
          （设施位置不一样无所谓，对于Mower，使用后端的JSON重组功能将基建位置适配至一样即可）
           */
          if (workFile.fileRequest && workFile.fileRequest.requestInfrastructure) {
            const infrastructureMap = new Map();
            infrastructure.forEach(infra => {
              const key = `${infra.name}-${infra.level}`;
              infrastructureMap.set(key, (infrastructureMap.get(key) || 0) + 1);
            });

            const requestMap = new Map();
            workFile.fileRequest.requestInfrastructure.forEach(req => {
              const key = `${req.name}-${req.level}`;
              requestMap.set(key, (requestMap.get(key) || 0) + 1);
            });

            for (const [key, value] of requestMap) {
              if (!infrastructureMap.has(key) || infrastructureMap.get(key) !== value) {
                return false;
              }
            }
          }
        } // else 自定义适配的意义是筛选掉不符合自己资源的作业，若data.userInfo为空，则表示“没有不符合自己资源的作业”，准许通过
      }
    }
    return true;
  });
};

// //配置Fuse模糊查询
// const fuseSearch = (workFiles, query) => {
//   const options = {
//     includeScore: true,
//     keys: ['author', 'authorId', 'name', 'description']
//   };
//
//   const fuse = new Fuse(workFiles, options);
//   const results = fuse.search(query);
//
//   return results
//       .filter(result => result.score <= 0.1)
//       .sort((a, b) => a.score - b.score)
//       .map(result => result.item);
// };
//
// const filterWorkFilesBySearch = () => {
//   // 第五步筛选需求
//   if (workFileScreenData.workQuery !== '') {
//     data.filteredWorkFileList = fuseSearch(data.filteredWorkFileList, workFileScreenData.workQuery);
//   }
// }
//
// const emit = defineEmits(['update-workFileList']); //声明可以发出update-workFileList事件
// emit('update-workFileList', data.filteredWorkFileList)

const updateFilterData = async () => {
  const params = {
    type: workFileScreenData.type,
    layout: workFileScreenData.layout,
    dateRange: workFileScreenData.getFormattedDateRange(),
    workQuery: workFileScreenData.workQuery,
    sortOrder: workFileScreenData.convertToSortOrder(),
    currentPage: workFileScreenData.currentPage,
    pageSize: workFileScreenData.pageSize
  }
  await screenWorkFileList(params)
  filterWorkFiles() //重新获取作业列表后，再次检查是否启用了自定义适配，视情况对作业列表进行筛选
}
// 监视筛选条件的变化
watch(
    () => workFileScreenData.$state,
    () => {
      updateFilterData()
    },
    {deep: true}
);

// 监视分页参数，确保后端遍历的记录数在一定范围内，预防深度分页问题
const recordUpperLimit = 10000 // 定义上限
watchEffect(() => {
  if (workFileScreenData.currentPage * workFileScreenData.pageSize > recordUpperLimit) {
    workFileScreenData.currentPage = Math.floor(recordUpperLimit / workFileScreenData.pageSize)
    ElMessage.info('已达到页数检索上限，请考虑修改筛选栏参数以更精确地查询您想要的作业文件')
  }
})

//监听刷新标记，时刻准备为其它组件刷新数据
watchEffect(() => {
  if (refreshFlag.workFileListRefreshFlag) {
    updateFilterData()
    refreshFlag.workFileListRefreshFlag = false;
  }
})

// 在组件挂载时调用后端接口获取作业文件列表
onMounted(async () => {
  await updateFilterData()
  // console.log(data.workFileList)
});
</script>

<template>
  <div class="flex-layout">
    <el-card class="user-filter" shadow="always">
      <div class="filter-flex">
        <!-- 第一个筛选项 -->
        <div class="filter-item">
          <div class="filter-label"><b>作业类型</b></div>
          <el-segmented v-model="workFileScreenData.type" :options="types" size="default"/>
        </div>

        <!-- 第二个筛选项 -->
        <div class="filter-item">
          <div class="filter-label"><b>基建布局</b></div>
          <el-segmented v-model="workFileScreenData.layout" :options="layouts" size="default"/>
        </div>

        <!-- 第三个筛选项 -->
        <div class="filter-item">
          <div class="filter-label"><b>排序依据</b></div>
          <el-segmented v-model="workFileScreenData.sortType" :options="sortType" size="default"/>
        </div>

        <!-- 第四个筛选项 -->
        <div class="filter-item">
          <div class="filter-label"><b>排序方式</b></div>
          <el-segmented v-model="workFileScreenData.orderType" :options="orderType" size="default"/>
        </div>

        <!-- 第五个筛选项 -->
        <div class="filter-item">
          <div class="filter-label"><b>是否启用自定义适配</b></div>
          <el-switch v-model="workFileScreenData.isEnableAdapter"></el-switch>
          <el-tooltip
              content="开启时，作业列表将不会显示那些您的干员养成练度或基建排布配置无法满足的作业文件（该功能与发布者设置的“干员精英化要求”和“基建布局等级要求”相关）"
              effect="dark"
              placement="top">
            <el-icon>
              <question-filled/>
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 第六个筛选项 -->
        <div class="filter-item ws-special">
          <div class="filter-label"><b>发布日期</b></div>
          <el-date-picker
              v-model="workFileScreenData.dateRange"
              :shortcuts="dateShortcuts"
              end-placeholder="结束日期"
              start-placeholder="开始日期"
              type="datetimerange"
          />
        </div>

        <!-- 第七个筛选项 -->
        <div class="filter-item ws-special">
          <div class="filter-label"><b>作业查询</b></div>
          <el-input
              v-model="workFileScreenData.workQuery"
              clearable
              placeholder="作业ID、名称、描述、发布者、发布者ID"
          ></el-input>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.flex-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.user-filter {
  //width: 1050px;
}

.filter-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  white-space: nowrap; /* 防止标签换行 */
}

.filter-label {
  margin-right: 10px;
  white-space: nowrap; /* 防止标签换行 */
}

.el-icon {
  margin-left: 12px;
}
</style>
<style lang="scss">
.ws-special {
  .el-date-editor {
    --el-date-editor-datetimerange-width: 340px !important;

    .el-range__icon{
      margin-right: 12px;
    }
  }
  .el-input__wrapper{
    width: 18em;
  }
}
</style>
