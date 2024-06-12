import {defineStore} from 'pinia'

const environmentVariable = import.meta.env.ARKNIGHTS_RUNTIME_ENVIRONMENT;
export const useBackendInterface = defineStore('globalBackendInterface', {
    state: () => ({
        backendInterfaceStartWith: ()=>{
            switch (environmentVariable){
                case 'production': return 'https://backend.arknightsinfrastructurestation.cn'
                case 'development': return 'http://localhost:8080'
            }
        }
    }),
})