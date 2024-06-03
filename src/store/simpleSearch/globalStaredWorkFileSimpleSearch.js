import {defineStore} from "pinia";

export const useStaredWorkFileSimpleSearch = defineStore('globalStaredWorkFileSimpleSearch', {
    state: () => ({
        workQuery: '',
        currentPage: 1,
        pageSize: 10,
    })
})