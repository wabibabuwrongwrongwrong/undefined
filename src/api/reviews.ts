import request from '@/utils/request'
import { useTokenStore } from '@/stores/mytoken'

type Response = {
  content: JSON
  message: string
  state: number
  success: boolean
}
type PatchReviewInfo = {
  result: string
  comments: string
}

export const getReviews = (): Promise<Response> => {
  return request
    .get<Response>('/api/v1/reviews/')
    .then((response) => response.data)
    .catch((error) => {
      console.log('获取Review失败', error)
      throw error
    })
}

export const getReviewsByID = (id: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/reviews/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log('获取题目核验结果失败', error)
      console.log(`核验结果id为：${id}`, id)
      throw error
    })
}

export const postReviewsByID = (id: string, exerciseByIDInfo: any): Promise<Response> => {
  return request
    .post<Response>(`/api/v1/reviews/${id}`, exerciseByIDInfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('发送单条review失败', error)
      throw error
    })
}

// 相当于update
export const patchReviewsByID = (
  id: string,
  ReviewByIDInfo: PatchReviewInfo
): Promise<Response> => {
  return request
    .patch<Response>(`/api/v1/reviews/${id}`, ReviewByIDInfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('更新单条review失败', error)
      throw error
    })
}

export const getReviewsByPage = (page: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/reviews/?page=${page}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log(`获取ReviewPage${page}结果失败`, error)
      throw error
    })
}
