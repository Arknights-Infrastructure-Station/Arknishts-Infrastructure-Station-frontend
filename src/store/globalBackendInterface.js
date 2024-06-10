import {defineStore} from 'pinia'

const environmentVariable = import.meta.env.ARKNIGHTS_DEVELOPMENT;
export const useBackendInterface = defineStore('globalBackendInterface', {
    state: () => ({
        backendInterfaceStartWith: environmentVariable ?
            'https://backend.arknightsinfrastructurestation.cn' : 'http://localhost:8080'
    }),
})