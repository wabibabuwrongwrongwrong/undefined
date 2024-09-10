<script setup lang="ts">
import { isCollapse } from '@/components/layout/isCollapse'
import { getInfo } from '@/api/users'
import { useTokenStore } from '@/stores/mytoken'
import router from '@/router'
import { getExercises, postExercises, patchExercises, deleteExercises } from '@/api/exercises'

const exerciseinfo = reactive({
  title: 'str',
  explanation: 'str1',
  answer: 'str2',
  source: 'str3',
  image_path: 'string'
})

// //谨慎使用 :(
// getExercises()
//   .then((res) => {
//     console.log(res.content)
//   })
//   .catch((err: Error) => {
//     console.log(err)
//   })

// patchExercises(exerciseinfo, '12')
//   .then((res) => {
//     console.log(res.content)
//   })
//   .catch((err: Error) => {
//     console.log(err)
//   })

// deleteExercises('12')
//   .then((res) => {
//     console.log(res.content)
//   })
//   .catch((err: Error) => {
//     console.log(err)
//   })

const handleLogout = async () => {
  await ElMessageBox.confirm('确认退出吗', '退出询问', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
  useTokenStore().saveToken({} as JSON)
  await router.push({ name: 'login' })
}
</script>

<template>
  <el-header>
    <!--    图标-->
    <el-icon @click="isCollapse = !isCollapse">
      <IEpExpand v-show="isCollapse" />
      <IEpFold v-show="!isCollapse" />
    </el-icon>
    <!--    面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">主页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">promotion management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>promotion list</el-breadcrumb-item>
      <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    下拉框-->
    <el-dropdown>
      <span class="el-dropdown-link">
        <el-avatar
          :size="50"
          :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
        />
        <el-icon class="el-icon--right">
          <IEpArrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>用户姓名</el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<style scoped lang="scss">
.el-header {
  display: flex;
  align-items: center;
  background-color: #dedfe0;

  .el-icon {
    cursor: pointer;
    margin-right: 18px;
  }
}

.el-dropdown {
  margin-left: auto;

  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}
</style>
