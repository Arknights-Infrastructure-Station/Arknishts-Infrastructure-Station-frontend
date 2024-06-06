import {defineStore} from 'pinia'

export const useRefreshFlag = defineStore('globalRefreshFlag', {
    state: () => ({
        //标记为true表示需要刷新
        workFileListRefreshFlag: false
    }),
})