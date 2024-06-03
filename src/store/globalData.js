import {defineStore} from 'pinia'

export const useData = defineStore('globalData', {
    state: () => ({
        userInfo: {
            //为operators和infrastructure设置默认值以防读取错误
            operators: [],
            infrastructure: []
        }, // 用户信息
        starList: [], // 收藏列表
        staredWorkFileList: [], // 收藏作业列表
        staredWorkFileListCount: 0, // 收藏作业列表总数量
        workFileList: [], // 作业文件列表
        workFileListCount: 0, // 作业文件总数量
        filteredWorkFileList: [], // 经过自定义适配后的作业文件列表
        postedWorkFileList: [], // 我发布的作业
        postedWorkFileListCount: 0, // 我发布的作业总数量
        stagingWorkFileList: [], // 暂存作业列表
        stagingWorkFileListCount: 0, // 暂存作业总数量
        recyclingWorkFileList: [], // 待清除作业列表
        recyclingWorkFileListCount: 0, // 待清除作业总数量
    }),
})