<!-- src/components/TablePage.vue -->
<template>
  <div class="mainPage circleBar">
    <div class="circleBar TableArea">
      <el-table
        ref="thisRefTable"
        :data="CurrentReviewsList"
        :key="TableRefreshKey"
        style="width: 100%; text-align: center; font-size: 17px"
        table-layout="fixed"
      >
        <el-table-column property="id" label="审核记录" width="100" />
        <el-table-column property="exercise" label="题目id" width="100" />
        <!-- !!!!!!!獲得title額外花費請求,先刪了 -->
        <!-- <el-table-column property="title" label="题目内容" width="600">
          <template #default="scope">
            <span>{{ truncate(scope.row.title, 70) }}</span>
          </template>
        </el-table-column> -->
        <el-table-column property="result" label="审核结果">
          <template #default="scope">
            {{ truncate(scope.row.result, -1) }}
          </template>
        </el-table-column>
        <el-table-column property="created_date" label="创建时间">
          <template #default="scope">
            {{ getCreatedTime(scope.row.created_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope" :key="CheckButtonRefreshKey">
            <el-button class="" type="default" @click="JumpToUploadPage(scope.row?.id)">
              检查
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="PageBar demo-pagination-block" clearfix>
      <el-button class="rightfix" @click="handleCurrentChange(currentPage)">跳转</el-button>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :disabled="false"
        layout="prev, pager, next, jumper"
        :total="MaxTitle"
        @current-change="handleCurrentChange"
        class="rightfix"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '@/router'
import { HandleRefreshToken, refreshToken, verifyToken } from '@/api/users'
import { getExercises, getExercisesByPage, getExercisesByID } from '@/api/exercises'
import { getReviews, getReviewsByPage } from '@/api/reviews'
import { ElTable, ElTableColumn, ElButton } from 'element-plus'
import splitPage, { ArrayifyPageData } from '@/api/splitPage'

interface Review {
  id: number
  exercise: number
  result: string | null
  comments: string | null
  created_date: string
  title: string
  [key: string]: any // 索引签名，允许任何额外的属性
}

let CurrentReviewsList = ref<Review[]>([])
const CheckButtonRefreshKey = ref()
const TableRefreshKey = ref() // 留著强制渲染用

onMounted(async () => {
  //首次加载默认第1頁
  const temp = await getReviews()
  MaxTitle.value = (temp.content as unknown as any).count // 獲取最大項目條數
  ArrayifyPageData(temp).forEach((e, index) => {
    CurrentReviewsList.value[index] = e
    // CurrentReviewsList.value[index].title = await getTitle(e.exercise)
  })
})

const SwitchPage = async (page: string) => {
  for (const [index, e] of ArrayifyPageData(await getReviewsByPage(page)).entries()) {
    CurrentReviewsList.value[index] = e
    // CurrentReviewsList.value[index].title = await getTitle(e.exercise)
  }
  console.log('CurrentReviewsList', CurrentReviewsList.value)
}
//      <!-- !!!!!!!獲得title額外花費請求,先隱藏 -->
// const getTitle = async (exerciseId: number) => {
//   return ((await getExercisesByID(exerciseId)).content as unknown as any).title
// }

// 過濾器,超過特定字數自動截斷加'...'
const truncate = (value, length: number) => {
  if (length === -1) {
    return '沒有結果'
  }
  if (!value) return ''
  if (value.length <= length) return value
  return value.substring(0, length) + '...'
}

// 轉時間
function getCreatedTime(inputString: string) {
  // 解析ISO 8601格式的日期时间字符串
  const date = new Date(inputString)

  // 获取年、月、日、小时、分钟和秒
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份是从0开始的
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  // 构建新的日期时间格式字符串
  const formattedDateTime = `${year}-${month}-${day},${hours}:${minutes}:${seconds}`
  return formattedDateTime
}

// 檢查頁面跳轉
const JumpToUploadPage = async (reviewID: string | number) => {
  const { href } = router.resolve({
    path: `/review`,
    query: {
      ReviewId: reviewID
    }
  })
  // window.open没能调用全局路由守卫，判断token让拦截器来
  try {
    await verifyToken()
    window.open(href, '_blank')
  } catch {
    console.log('验证过期')
    alert('验证已过期,返回登录页面')
    router.push('/login')
    window.open(location.href, '_self')
  }
}

// el-分頁欄 相關
let currentPage = ref(1)
const pageSize = ref(10)
const MaxTitle = ref(10)

const handleCurrentChange = async (val: number) => {
  await SwitchPage(val + '')
  console.log(`current page: ${val}`)
}
</script>

<style scoped lang="scss">
.leftfix {
  float: left;
}
.rightfix {
  float: right;
}
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}
.circleBar {
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 40px;
  padding: 30px 30px;
  border-bottom: solid 2px #e5e7eb;
}

:deep(.el-table__head th) {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px 0px; /* 增加单元格内部的填充 */
}
:deep(.el-table__body td) {
  padding: 10px 0px; /* 增加单元格内部的填充 */
  border: 1px solid #e5e7eb;
}
:deep(.el-table th.is-leaf) {
  border: none;
  padding: 10px 0px;
  // font-size: 20px;
  // font-weight: 400;
}

.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
.mainPage {
  border-radius: 0;
  padding-bottom: 50px;
}

.PageBar {
  margin-top: 20px;
  align-self: center;
}
</style>
