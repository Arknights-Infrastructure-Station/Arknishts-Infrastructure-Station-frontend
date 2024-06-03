import {defineStore} from 'pinia'

export const useBackendInterface = defineStore('globalBackendInterface', {
    state: () => ({
        backendInterfaceStartWith: 'http://localhost:8080',
        // backendInterfaceStartWith: 'https://backend.arknightsinfrastructurestation.cn',
    }),
})