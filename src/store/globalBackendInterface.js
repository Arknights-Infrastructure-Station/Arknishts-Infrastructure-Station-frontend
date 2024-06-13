import {defineStore} from 'pinia'

export const useBackendInterface = defineStore('globalBackendInterface', {
    state: () => ({
        backendInterfaceStartWith: import.meta.env.VITE_API_BASE_URL
    })
});
