import {defineStore} from 'pinia'

export const useBackendInterface = defineStore('globalBackendInterface', {
    state: () => ({
        backendInterfaceStartWith: 'http://localhost:8080' //生产环境的实际后端接口由Nginx做转发
    })
});
