import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import "@/assets/css/layout/page_content.css"
import "@/assets/css/sprite/sprite_avatar.css";
import "@/assets/css/sprite/sprite_rank.css";

import '@/assets/global.css'
import '@/assets/css/userWorkFileList/user_work_file_list.css'

import "./../node_modules/vditor/dist/index.css";

import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App);
const pinia = createPinia()

//全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.use(pinia)

app.mount('#app')
