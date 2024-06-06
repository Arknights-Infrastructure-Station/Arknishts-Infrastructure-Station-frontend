import {defineStore} from 'pinia'
import {formatDate} from "@/utils/commonMethods.js";

export const useWorkFileScreenData = defineStore('globalWorkFileScreenData', {
    state: () => ({
        type: '全部', // 默认选择“全部”
        layout: '全部', // 默认选择“全部”
        isEnableAdapter: false, //是否启用自定义适配
        dateRange: [], //日期范围
        workQuery: '', //多字段模糊查询字符串
        sortType: '发布时间', //排序依据
        orderType: '降序', //排序方式
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
        convertToSortOrder() {
            switch (this.orderType) {
                case '降序':
                    switch (this.sortType) {
                        case '发布时间':
                            return 'releaseDateDesc';
                        case '评分':
                            return 'scoreDesc';
                    }
                    break;
                case '升序':
                    switch (this.sortType) {
                        case '发布时间':
                            return 'releaseDateAsc';
                        case '评分':
                            return 'scoreAsc';
                    }
                    break;
            }
        }
    }
})