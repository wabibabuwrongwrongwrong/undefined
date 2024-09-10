import axios, { type AxiosResponse } from 'axios'
import { useTokenStore } from '@/stores/mytoken'
import { refreshToken } from '@/api/users'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://47.102.20.196:8000/'
})

// 拦截器能正常工作，问题出在 ： 发送网络请求获取数据时，access过期，请求refresh并重新发送之前的请求
// 虽然第二次请求成功获取数据，但是返回的是第一次请求失败的结果，于是获取数据失败，响应式数据未更新，渲染也摆烂

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 确保 config.headers 存在
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders()
    }

    // 提取data对象，如果存在的话
    const { data } = config
    let tmp = true // 检查data是否为对象，并且包含username和password,tmp为login规避设置authorization
    if (data && typeof data === 'object' && 'username' in data && 'password' in data) {
      console.log('发送登录请求')
      tmp = false
    }

    // 获取 token store
    const store = useTokenStore()

    // store.token 存在，则设置Authorization头
    if (store.token.access && tmp) {
      config.headers.Authorization = `Bearer ${store.token.access}`
    }

    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 将正确请求到的数据进行返回，而不是直接返回Promise.reject
// 响应拦截器
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    // console.log('响应拦截器执行')
    let tmp: Promise<AxiosResponse<any, any>> | null
    tmp = null
    if (error.response?.status === 401) {
      console.log('Error status:', error.response.status)
      await refreshToken()
        .then((res) => {
          useTokenStore().saveToken(res.content)
          // 返回重新发送的请求
          tmp = request(error.config)
          return tmp
        })
        .catch((error) => {
          console.error('刷新 token 失败', error)
          // 如果刷新 token 失败，跳转到登录页面
          // alert('頁面已過期')
          router.push({ name: 'login' })
          window.open(location.href, '_self') // 页面有时不会刷新
        })
    } else if (error.response?.status === 400) {
      // !!!!!!!!!!絕對 不要 在status ===400下再次使用request請求
      // console.log('status 400,Error: ', error.response)
    }

    // console.log('拦截器拒绝,返回包error: ', error.response, '  tmp: ', tmp)
    return tmp ? tmp : Promise.reject(error)
  }
)

export default request
