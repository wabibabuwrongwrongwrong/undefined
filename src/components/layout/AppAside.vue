<script setup lang="ts">
import { isCollapse } from '@/components/layout/isCollapse'
</script>

<template>
  <el-aside>
    <el-scrollbar>
      <el-menu router unique-opened :collapse="isCollapse" :default-openeds="['2']">
        <a href="/" class="logo">
          <img src="@/assets/logo.svg" alt="" />
          <h1>后台管理</h1>
        </a>

        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>权限管理</span>
          </template>

          <el-menu-item index="/table">
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>权限列表</span>
          </el-menu-item>

          <el-menu-item index="/resources">
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>资源列表</span>
          </el-menu-item>

          <el-menu-item index="/roles">
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>角色列表</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/users">
          <el-icon>
            <IEpSetting />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>题目管理</span>
          </template>

          <el-menu-item index="/exercises" default>
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>审核列表</span>
          </el-menu-item>

          <el-menu-item index="/upload">
            <el-icon>
              <IEpSetting />
            </el-icon>
            <span>上传题目</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/courses">
          <el-icon>
            <IEpSetting />
          </el-icon>
          <span>课程管理</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: black;
  height: 60px;

  img {
    width: 32px;
    height: 32px;
  }
}

.el-aside {
  background-color: #e9e9eb;
  height: 100vh;
  width: auto;
}

.el-menu {
  background-color: #e9e9eb;
  border-right: none;
  width: 200px;

  &.el-menu--collapse {
    width: 60px;
    & h1 {
      display: none;
    }
  }
}
</style>
