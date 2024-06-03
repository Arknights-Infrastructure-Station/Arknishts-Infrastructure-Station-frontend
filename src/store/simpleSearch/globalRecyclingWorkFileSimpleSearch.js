import {defineStore} from "pinia";

export const useRecyclingWorkFileSimpleSearch = defineStore('globalRecyclingWorkFileSimpleSearch', {
    state: () => ({
        workQuery: '',
        currentPage: 1,
        pageSize: 10,
    })
})