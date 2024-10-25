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

export const getTopicsByID = (id: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/topics/${id}`)
    .then((response) => {
      console.log(`获取topic${id}成功`)
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
