import {defineStore} from 'pinia'
import {formatDate} from "@/utils/commonMethods.js";

export const useWorkFileScreenData = defineStore('globalWorkFileScreenData', {
    state: () => ({
        type: '全部', // 默认选择“全部”
        layout: '全部', // 默认选择“全部”
        isEnableAdapter: false,
        dateRange: [],
        workQuery: '',
        currentPage: 1,
        pageSize: 10,
    }),
    actions: {
        getFormattedDateRange() {
            if (this.dateRange.length === 2) {
                const startDate = formatDate(this.dateRange[0]);
                const endDate = formatDate(this.dateRange[1]);
                return [startDate, endDate];
            }
            return [];
        },
    }
})