import {createWebHistory, createRouter} from 'vue-router'
import {ElMessage} from "element-plus";

export const baseRoutes = [
    // 重定向至首页
    {
        path: '',
        redirect: '/tools/infraStat' //适配一图流的路由路径格式
    },
    // 用户相关
    {
        path: '/user',
        component: () => import('@/layout/index.vue'),
        children: [
            // 用户个人中心
            {
                name: 'home',
                path: 'home',
                component: () => import('@/views/user/home.vue')
            },
            // 登录
            {
                name: 'login',
                path: 'login',
                component: () => import('@/views/user/login.vue')
            },
            // 注册
            {
                name: 'register',
                path: 'register',
                component: () => import('@/views/user/register.vue')
            },
            // 忘记密码
            {
                name: 'forgetPassword',
                path: 'forgetPassword',
                component: () => import('@/views/user/forgetPassword.vue')
            },
        ]
    },
    // 用户作业相关
    {
        path: '/userWorkFileList',
        component: () => import('@/layout/index.vue'),
        children: [
            // 作业发布记录
            {
                name: 'uploadRecord',
                path: 'uploadRecord',
                component: () => import('@/views/userWorkList/uploadRecord.vue'),
            },
            // 作业收藏界面
            {
                name: 'starList',
                path: 'starList',
                component: () => import('@/views/userWorkList/starList.vue'),
            },
            // 作业草稿箱
            {
                name: 'draftBox',
                path: 'draftBox',
                component: () => import('@/views/userWorkList/draftBox.vue'),
            },
            // 作业回收箱
            {
                name: 'recyclingBin',
                path: 'recyclingBin',
                component: () => import('@/views/userWorkList/recyclingBin.vue'),
            },
        ]
    },
    // 外包工具导航栏格式
    {
        path: '/tools/infraStat',
        component: () => import('@/layout/index.vue'),
        children: [
            //首页，作业展示列表
            {
                name: 'index',
                path: '',
                component: () => import('@/views/index.vue')
            },
            // 上传作业（与编辑作业同一个页面）
            {
                name: 'uploadAndEdit',
                path: 'uploadAndEdit',
                component: () => import('@/views/edit/uploadAndEdit.vue'),
            },
            // 自定义干员养成练度
            {
                name: 'setOperators',
                path: 'setOperators',
                component: () => import('@/views/edit/setOperators.vue'),
            },
            // 自定义基建排布配置
            {
                name: 'setInfrastructure',
                path: 'setInfrastructure',
                component: () => import('@/views/edit/setInfrastructure.vue'),
            }
        ]
    },
    // 未知页面
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/error/404.vue'),
    },
    // 测试页面
    {
        path: '/test',
        component: () => import('@/test/TestComponent.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: baseRoutes
});

const restrictedPaths = ['/user/home', '/userWorkFileList/uploadRecord', '/userWorkFileList/starList',
    '/userWorkFileList/draftBox', '/userWorkFileList/recyclingBin', '/tools/infraStat/uploadAndEdit', '/tools/infraStat/setOperators',
    '/tools/infraStat/setInfrastructure'];
const restrictedNames = ['home', 'uploadRecord', 'starList', 'draftBox', 'recyclingBin','uploadAndEdit', 'setOperators', 'setInfrastructure'];

// 在进行路由跳转时，如果要跳转的页面是登录后才能访问的页面，则进行拦截，重导航至登录页面
router.beforeEach((to, from, next) => {
    if ((restrictedPaths.includes(to.path) || restrictedNames.includes(to.name)) && localStorage.getItem('ais_token') === null) {
        // 如果匹配，重定向到特定路由
        next({name: 'login'});
        ElMessage.info('需要先登录才能访问这些页面哦')
    } else {
        // 如果不匹配，继续正常导航
        next();
    }
});

export default router;
