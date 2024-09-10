import request from '@/utils/request'
import { useTokenStore } from '@/stores/mytoken'
import router from '@/router'

type Response = {
  content: JSON
  message: string
  state: number
  success: boolean
}

type LoginInfo = {
  username: string
  password: string
}
//获取token
export const login = (loginInfo: LoginInfo): Promise<Response> => {
  return request
    .post<Response>('/token/', loginInfo)
    .then((response) => response.data)
    .catch((error) => {
      console.log('token获取失败', error)
      throw error
    })
}
//验证token
export const verifyToken = (): Promise<Response> => {
  return request
    .post<Response>('/token/verify/', { token: useTokenStore().token?.access })
    .then((response) => response.data)
    .catch((error) => {
      console.log('token验证失败', error)
      throw error
    })
}

//刷新token(原来)
export const refreshToken = (): Promise<Response> => {
  // console.log('excute refershtoken')
  return request
    .post<Response>('/token/refresh/', { refresh: useTokenStore().token?.refresh })
    .then((response) => {
      return response.data
    })
}

// 强制刷新
export const HandleRefreshToken = (): Promise<Response> => {
  console.log('excute HandleRefreshToken token')
  return refreshToken()
    .then((res) => {
      useTokenStore().saveToken(res.content)
      return res
    })
    .catch((error) => {
      console.error('刷新 token 失败', error)
      router.push({ name: 'login' })
      return Promise.reject(error) // 这里返回的是 Promise.reject，它的类型仍然是 Promise<Response>
    })
}

// 获取用户详细信息
const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.user_id || null
  } catch (e) {
    return null
  }
}

export const getInfo = async (): Promise<Response> => {
  const store = useTokenStore()
  const token = store.token?.access

  const userId = getUserIdFromToken(token)
  if (!userId) {
    throw new Error('Invalid token: unable to extract user_id')
  }

  return request
    .get<Response>(`/api/v1/users/${userId}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error
    })
}
