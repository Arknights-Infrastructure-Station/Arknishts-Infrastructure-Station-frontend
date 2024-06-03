import {defineStore} from "pinia";

export const usePostedWorkFileSimpleSearch = defineStore('globalPostedWorkFileSimpleSearch', {
    state: () => ({
        workQuery: '',
        currentPage: 1,
        pageSize: 10,
    })
})