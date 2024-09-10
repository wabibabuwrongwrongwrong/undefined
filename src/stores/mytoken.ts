import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

interface Token {
  access: string
  refresh: string
}

const BaseURL = 'http://47.102.20.196:8000' as string

export const useTokenStore = defineStore('mytoken', () => {
  const tokenJson = ref('')
  const token = computed<Token>(() => {
    try {
      // const storedToken = tokenJson.value ? tokenJson.value : window.localStorage.getItem('token')
      const storedToken = tokenJson.value || window.localStorage.getItem('token')
      if (storedToken) {
        return JSON.parse(storedToken)
      }
      return { access: '', refresh: '' } as Token // 返回一个空的Token对象
    } catch (err) {
      ElMessage.error('JSON 解析错误')
      throw err
    }
  })

  function saveToken(jsonData: JSON) {
    const stringData = JSON.stringify(jsonData) // 将JSON对象转换为字符串
    tokenJson.value = stringData
    window.localStorage.setItem('token', stringData) // 确保键名一致
  }

  return { token, saveToken }
})
