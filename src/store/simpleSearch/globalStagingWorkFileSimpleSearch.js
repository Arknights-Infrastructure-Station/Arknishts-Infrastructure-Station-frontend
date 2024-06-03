import {defineStore} from "pinia";

export const useStagingWorkFileSimpleSearch = defineStore('globalStagingWorkFileSimpleSearch', {
    state: () => ({
        workQuery: '',
        currentPage: 1,
        pageSize: 10,
    })
})