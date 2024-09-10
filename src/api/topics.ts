import request from '@/utils/request'
// import axios from 'axios'
// import { useTokenStore } from '@/stores/mytoken'
// import { refreshToken } from './users'
// import router from '@/router'
type Response = {
  content: JSON
  message: string
  state: number
  success: boolean
}
export const getTopics = (): Promise<Response> => {
  return request
    .get<Response>('/api/v1/topics/')
    .then((response) => {
      console.log('获取topic成功')
      return response.data
    })
    .catch((error) => {
      console.log('获取topic失败', error)
      throw error
    })
}

export const getTopicsByPage = (page: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/topics/?page=${page}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log(`topics获取page${page}失败`, error)
      throw error
    })
}
// const req = axios.create({
//   baseURL: 'http://47.102.20.196:8000/'
// })
// req.interceptors.request.use(
//   (config) => {
//     // 确保 config.headers 存在
//     if (!config.headers) {
//       config.headers = new axios.AxiosHeaders()
//     }

//     // 获取 token store
//     const store = useTokenStore()

//     // store.token 存在，则设置Authorization头
//     if (store.token.access) {
//       config.headers.Authorization = `Bearer ${store.token.access}`
//     }
//     return config
//   },
//   (error) => {
//     // 对请求错误做些什么
//     return Promise.reject(error)
//   }
// )
// // 最簡單的方式是先刷新再獲取數據
// export const getTopics = async () => {
//   refreshToken()
//     .then((res) => {
//       useTokenStore().saveToken(res.content)
//     })
//     .catch((error) => {
//       console.error('刷新 token 失败', error)
//       // 如果刷新 token 失败，跳转到登录页面
//       router.push({ name: 'login' })
//       return Promise.reject(error)
//     })

//   return req
//     .get<Response>('/api/v1/topics/')
//     .then((response) => response.data)
//     .catch((error) => {
//       console.log('获取topics失败', error)
//       throw error
//     })
// }
