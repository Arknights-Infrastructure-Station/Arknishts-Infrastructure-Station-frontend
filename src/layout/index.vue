<script setup>
import logo from '@/assets/logo/logo.png'
import {useData} from "@/store/globalData.js";
import {ElMessage, ElMessageBox} from "element-plus";
import axios, {fieldsToSave} from "@/utils/axios.js";

const data = useData()

const isLogin = ref(false)
isLogin.value = localStorage.getItem('ais_token') !== null

function openLink(url) {
  window.open(url, '_blank').focus();
}

const logout = () => {
  ElMessageBox.confirm(
      '您确定要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确认退出登录',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
      }
  )
      .then(async () => {
        let response
        try {
          response = await axios.post('/api/user/logout');
          localStorage.clear() //注销登录会清除所有缓存
          ElMessage.success(response.data)
        } catch (error) {
          ElMessage.error(response.data);
        }
        setTimeout(() => {
          location.href = '/'
        }, 2000)
      })
}

const clearLocalStorage = () => {
  ElMessageBox.confirm(
      '您确定要清除缓存吗？',
      '清除缓存',
      {
        confirmButtonText: '确认清除缓存',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
      }
  )
      .then(() => {
        fieldsToSave.forEach(field => localStorage.removeItem(field))
        ElMessage.success('缓存已清除')
      })
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <!--启用router模式，在激活导航时以 index 作为 path 进行路由跳转，-->
        <el-menu
            :ellipsis="false"
            :router="true"
            :unique-opened="true"
            mode="horizontal"
        >
          <el-menu-item index="/tools/infraStat"> <!--以“/”起始，便不以父级路由路径为起始，否则以父级路由路径为起始-->
            <el-image v-if="logo" :src="logo" alt="年泡泡" style="width: 50px; margin-right: 9px"/>
            <el-text tag="b">
              明日方舟基建作业站
            </el-text>
          </el-menu-item>
          <div class="flex-grow"/>
          <el-sub-menu index="1"> <!--这里的index用于区分不同的子菜单，而非路由跳转，点击它并不会触发路由跳转的功能；若去掉，所有的子菜单的操作便会同步，失去可区分性-->
            <template #title>自定义数据</template>
            <!--<template #title>用于告诉组件这是子菜单的标题，去掉#title会失去标题，整个去掉会将这段文字错误地渲染到子菜单中-->
            <el-menu-item index="/tools/infraStat/setOperators">
              <Edit style="width: 1em; height: 1em; margin-right: 8px"/>
              干员养成练度
            </el-menu-item>
            <el-menu-item index="/tools/infraStat/setInfrastructure">
              <Edit style="width: 1em; height: 1em; margin-right: 8px"/>
              基建排布配置
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>作业</template>
            <el-sub-menu index="2-1">
              <template #title>
                <Plus style="width: 1em; height: 1em; margin-right: 8px"/>
                上传作业
              </template>
              <el-sub-menu :popper-offset="-408" index="2-1-1"> <!--向左偏移-->
                <template #title>
                  使用作业编辑器
                </template>
                <el-menu-item @click="openLink('https://ark.yituliu.cn/tools/schedule')">
                  MAA
                </el-menu-item>
                <el-menu-item @click="openLink('#')">
                  Mower（暂无链接）
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item index="/tools/infraStat/uploadAndEdit">
                上传本地作业
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2-2">
              <template #title>
                <House style="width: 1em; height: 1em; margin-right: 8px"/>
                我的作业
              </template>
              <el-menu-item index="/userWorkFileList/uploadRecord">
                <Operation style="width: 1em; height: 1em; margin-right: 8px"/>
                我发布的作业
              </el-menu-item>
              <el-menu-item index="/userWorkFileList/draftBox">
                <Box style="width: 1em; height: 1em; margin-right: 8px"/>
                我的草稿箱
              </el-menu-item>
              <el-menu-item index="/userWorkFileList/recyclingBin">
                <Delete style="width: 1em; height: 1em; margin-right: 8px"/>
                我的回收箱
              </el-menu-item>
              <el-menu-item index="/userWorkFileList/starList">
                <Star style="width: 1em; height: 1em; margin-right: 8px"/>
                我的收藏
              </el-menu-item>
            </el-sub-menu>

          </el-sub-menu>
          <el-sub-menu v-if="isLogin" index="3">
            <template #title>
              <div style="width: 30px;position: relative">
                <div :class="`bg-${data.userInfo.avatar}`" class="user-avatar"/>
              </div>

            </template>
            <el-menu-item index="/user/home">个人中心</el-menu-item>
            <el-sub-menu index="3-1">
              <template #title>用户操作</template>
              <el-menu-item @click="logout">
                <Warning class="danger-operate-icon"/>
                <span class="danger-operate">注销登录</span>
              </el-menu-item>
              <el-menu-item @click="clearLocalStorage">
                <Warning class="danger-operate-icon"/>
                <span class="danger-operate">清除缓存</span>
              </el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-menu-item v-else index="/user/login">
            <template #title>去登录</template>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  position: absolute;
  left: -85px;
  top: -90px;
  transform: scale(0.25);
  border-radius: 50%;
}

.danger-operate {
  color: #ff2828;
}

.danger-operate-icon {
  width: 1em;
  height: 1em;
  margin-right: 8px;
  color: #fdd052;
}
</style>