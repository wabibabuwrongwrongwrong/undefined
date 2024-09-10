import request from '@/utils/request'
import { useTokenStore } from '@/stores/mytoken'

export type Response = {
  content: JSON
  message: string
  state: number
  success: boolean
}

export type ExerciseInfo = {
  title: string
  explanation: string
  answer: string
  source: string
  image_path: string
  topic: number
}
type ExerciseByIDInfo = {
  status: string
}

type PatchExerciseInfo = {
  title: string
  explanation: string
  answer: string
  source: string
  image_path: string
}

export const getExercises = (): Promise<Response> => {
  return request
    .get<Response>('/api/v1/exercises/')
    .then((response) => {
      console.log('获取exercises成功')
      return response.data
    })
    .catch((error) => {
      console.log('获取Exercise失败', error)
      throw error
    })
}

export const getExercisesByID = (id: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/exercises/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log('获取单条Exercise失败', error)
      throw error
    })
}

export const getExercisesByPage = (page: string): Promise<Response> => {
  return request
    .get<Response>(`/api/v1/exercises/?page=${page}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log(`Exercises获取page${page}失败`, error)
      throw error
    })
}

// 使用前先测试
export const postExercisesByID = (
  id: string,
  exerciseByIDInfo: ExerciseByIDInfo
): Promise<Response> => {
  return request
    .post<Response>(`/api/v1/exercises/${id}`, exerciseByIDInfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('发送单条Exercise失败', error)
      throw error
    })
}

export const postExercises = (exerciseinfo: ExerciseInfo): Promise<Response> => {
  return request
    .post<Response>('/api/v1/exercises/', exerciseinfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('发送大量Exercise失败', error)
      throw error
    })
}

export const patchExercises = (exerciseinfo: PatchExerciseInfo, id: string): Promise<Response> => {
  return request
    .patch<Response>(`/api/v1/exercises/${id}`, exerciseinfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('匹配Exercise失败', error)
      throw error
    })
}

export const deleteExercises = (id: string): Promise<Response> => {
  return request
    .delete<Response>(`/api/v1/exercises/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.log('删除Exercise失败', error)
      throw error
    })
}
