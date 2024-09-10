<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { login } from '@/api/users'
import { useTokenStore } from '@/stores/mytoken'
import router from '@/router'
import { useRoute } from 'vue-router'

const store = useTokenStore()
const route = useRoute()
const isLoading = ref(false)
const formRef = ref<FormInstance>()
// const form = reactive({
//   username: 'XiaoHong',
//   password: 'Hong123456'
// })
const form = reactive({
  username: 'HanMeimei',
  password: 'Han123456'
})

const formRules = reactive<FormRules>({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
})

const onSubmit = async () => {
  isLoading.value = true
  await formRef.value?.validate().catch((err: Error) => {
    ElMessage.error('表单校验失败')
    throw err
  })

  try {
    const res = await login(form)
    store.saveToken(res.content)
    console.log('success', res.content)
    await router.push((route.query.redirect as string) || '/')
  } catch (error) {
    console.error('登录信息有误:', error)
    ElMessage.error('登录信息有误')
  }
  isLoading.value = false
}
</script>

<template>
  <div class="login">
    <el-form :model="form" :rules="formRules" ref="formRef" label-width="auto" size="large">
      <h2>登录</h2>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="isLoading">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.login {
  background: #ccc;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-form {
    width: 300px;
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;

    .el-form-item {
      margin-top: 20px;
    }

    .el-button {
      margin-top: 20px;
      width: 100%;
    }
  }
}
</style>
