<!-- src/components/TablePage.vue -->
<template>
  <div class="mainPage">
    <div class="circleBar TableArea clearfix">
      <el-select v-model="selectModel" placeholder="全部" size="large" style="width: 240px">
        <el-option
          v-for="item in selectArray"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          @click="SwitchExercisePage('1')"
        />
      </el-select>
      <el-popover
        :visible="popoverVisible"
        placement="bottom-end"
        :width="600"
        :height="600"
        style="padding: 20px"
        class="rightfix"
        trigger="click"
      >
        <template #reference>
          <el-button class="rightfix" @click="popoverVisible = !popoverVisible">
            {{ topicChoosing }}
          </el-button>
        </template>
        <div class="popoBox clearfix">
          <el-table :data="formattedTableData" style="width: 100%">
            <!-- 动态生成5列 -->
            <el-table-column
              v-for="colIndex in 2"
              :key="'col' + colIndex"
              width="280"
              prop="'column' + colIndex"
            >
              <template #default="scope">
                <el-icon style="margin-top: 3px; margin-right: 7px"><ArrowRightBold /></el-icon>
                <el-button @click="selectDefaultTopic(scope.row['column' + colIndex]?.id)">
                  {{ scope.row['column' + colIndex].title }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button style="margin-top: 5px; margin-left: 10px" @click="selectDefaultTopic()">
            查看全部知识点
          </el-button>

          <el-pagination
            v-model:current-page="TopicscurrentPage"
            layout="prev, pager, next"
            :total="10"
            @current-change="TopicsHandleCurrentChange"
            class="rightfix"
          />
        </div>
      </el-popover>
      <!-- ref="thisRefTable" -->
      <el-table
        :data="CurrentExercisesList"
        :key="TableRefreshKey"
        style="width: 100%; text-align: center; font-size: 17px"
        table-layout="fixed"
      >
        <el-table-column property="id" label="题目id" width="80" />
        <el-table-column property="title" label="题目内容" width="600">
          <template #default="scope">
            <span>&nbsp;&nbsp;{{ truncate(scope.row.title, 70) }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </template>
        </el-table-column>
        <el-table-column label="知识点" width="250">
          <template #default="scope">
            <span>&nbsp;&nbsp;{{ GetTopicFromList(scope.row.topic) }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope" :key="CheckButtonRefreshKey">
            <el-button class="" type="default" @click="JumpToUploadPage(scope.row?.id)">
              修改
            </el-button>
            <el-button
              v-if="scope.row?.is_active == true"
              type="danger"
              @click="deleteExercises(scope.row?.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="scope.row?.is_active == false"
              type="success"
              @click="patchExercises(scope.row?.id)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="PageBar demo-pagination-block" clearfix>
      <el-button class="rightfix" @click="ExerciseHandleCurrentChange(currentPage)">跳转</el-button>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :disabled="false"
        layout="prev, pager, next, jumper"
        :total="ExerciseMaxTitle"
        @current-change="ExerciseHandleCurrentChange"
        class="rightfix"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '@/router'
import { verifyToken } from '@/api/users'
import {
  getExercises,
  getExercisesByPage,
  getExercisesByID,
  getExercisesByAny,
  deleteExercisesByID,
  patchExercisesByID
} from '@/api/exercises'
import { ElTable, ElTableColumn, ElButton, ElSelect } from 'element-plus'
import splitPage, { ArrayifyPageData } from '@/api/splitPage'
import { getTopics, getTopicsByPage } from '@/api/topics'
import { ArrowRightBold } from '@element-plus/icons-vue'
interface Review {
  id: number
  exercise: number
  result: string | null
  comments: string | null
  created_date: string
  title: string
  is_active: boolean
  [key: string]: any // 索引签名，允许任何额外的属性
}

let CurrentExercisesList = ref<Review[]>([]) // 存放获取的exercise列表
const CheckButtonRefreshKey = ref()

// const thisRefTable = ref<InstanceType<typeof ElTable>>()
const TableRefreshKey = ref() // 留著强制渲染用
// const PageBarRefreshKey = ref() // 留著强制渲染用

onMounted(async () => {
  await checkTopicsList()

  //首次加载默认第1頁
  const temp = await getExercises()
  ExerciseMaxTitle.value = (temp.content as unknown as any).count // 獲取最大項目條數
  ArrayifyPageData(temp).forEach((e, index) => {
    CurrentExercisesList.value[index] = e
    // CurrentExercisesList.value[index].title = await getTitle(e.exercise)
  })
})

// -----
//
// 001- topic部分处理
//    - 01 - 数据交换存储
// ------
interface Topics {
  title?: string
  [key: string]: any
}
const topicsList = ref([]) as Topics // 存放题目类型列表
const elementsArray = ref([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]) //摆放在泡泡栏的数据存储
const formattedTableData = computed(() => {
  const i = 2
  const rows = 5
  return Array.from({ length: rows }, (_, rowIndex) => {
    const row = {}
    Array.from({ length: i }).forEach((_, colIndex) => {
      const elementIndex = rowIndex * i + colIndex
      row['column' + (colIndex + 1)] =
        elementsArray.value[elementIndex] !== null ? elementsArray.value[elementIndex] : undefined
    })
    return row
  })
})

// topic切换页面时，更新elementsArray
const checkTopicsList = async (page?: string) => {
  let tmp = page ? await getTopicsByPage(page) : await getTopics()
  topicsList.value = ArrayifyPageData(tmp).map((e) => ({
    title: e?.title,
    id: e?.id
  }))
  // console.log(topicsList.value, 'tmp')
  topicsList.value.forEach((e, index) => {
    elementsArray.value[index] = e
  })
}
// Table显示topic，topic.id转文字
const GetTopicFromList = (i: number) => {
  const topic = topicsList.value.find((t) => t.id === i)
  return topic ? topic.title : '未定义'
}

// -----
//
// 001- topic部分处理
//    - 02 - 可视化泡泡框
// ------

// ?topic=id
const popoverVisible = ref(false)
const topicChoosing = ref<string>('全部知识点')
const selectDefaultTopic = async (id?: number) => {
  //
  // 更新exercise，
  //
  researchMode.value = id ? 'topic=' + id : 'Normal'
  if (researchMode.value === 'Normal') {
    topicChoosing.value = '全部知识点'
  } else {
    topicChoosing.value = GetTopicFromList(id as number)
  }
  currentPage.value = 1 //强制切exercise到page1
  await SwitchExercisePage()
  popoverVisible.value = false
  // console.log('checkeme!', researchMode.value, CurrentExercisesList.value)
}

// -----
//
// 001- topic部分处理
//    - 03 分页栏
// ------
const TopicscurrentPage = ref(1)
const TopicsHandleCurrentChange = async (val: number) => {
  await TopicsSwitchPage(val + '')
  // console.log(`current page: ${val}`)
}
const TopicsSwitchPage = async (page: string) => {
  for (const [index, e] of ArrayifyPageData(await getTopicsByPage(page)).entries()) {
    elementsArray.value[index] = e
  }
}

// topic处理结束
// ---------------------------------------------------
// ---------------------------------------------------

//!!!!!!!!!
//
//
//  切换exercise页面，
//

const researchMode = ref<string>('Normal')
let currentPage = ref(1)
const pageSize = ref(10)
const ExerciseMaxTitle = ref(10)

const ExerciseHandleCurrentChange = async (val: number) => {
  await SwitchExercisePage(val + '')
  console.log(`Exercise current page: ${val}`)
}

const SwitchExercisePage = async (page?: string) => {
  page = page ? page : '1'
  CurrentExercisesList.value = []
  switch (researchMode.value) {
    case 'Normal':
      // const tmp = await getExercisesByPage(page)
      const tmp = await getExercisesByAny(page, selectModel.value)

      for (const [index, e] of ArrayifyPageData(tmp).entries()) {
        CurrentExercisesList.value[index] = e
      }
      ExerciseMaxTitle.value = (tmp.content as unknown as any).count // 更新最大項目條數
      break
    default:
      const tmp2 = await getExercisesByAny(page, researchMode.value + '&' + selectModel.value)
      for (const [index, e] of ArrayifyPageData(tmp2).entries()) {
        CurrentExercisesList.value[index] = e
      }
      ExerciseMaxTitle.value = (tmp2.content as unknown as any).count
        ? (tmp2.content as unknown as any).count
        : 0 // 更新最大項目條數
      break
  }
  // PageBarRefreshKey.value += 1
  console.log('CurrentExercisesList', CurrentExercisesList.value)
  TableRefreshKey.value += 1
}

// 過濾器,超過特定字數自動截斷加'...'
const truncate = (value: string, length: number) => {
  if (length === -1) {
    return '沒有結果'
  }
  if (!value) return ''
  if (value.length <= length) return value
  return value.substring(0, length) + '...'
}

// ----操作功能-----
//
// 檢查頁面跳轉
const JumpToUploadPage = async (ExercisesID: string | number) => {
  const { href } = router.resolve({
    path: `/Revise`,
    query: {
      ExercisesID: ExercisesID
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
  }
}

// 刪除操作，检查
const deleteExercises = async (id: number) => {
  deleteExercisesByID(id + '')
  CurrentExercisesList.value[CurrentExercisesList.value.findIndex((e) => e.id === id)].is_active =
    false
}
// 修改操作，检查
const patchExercises = async (id: number) => {
  patchExercisesByID(id + '', { is_active: true })
  CurrentExercisesList.value[CurrentExercisesList.value.findIndex((e) => e.id === id)].is_active =
    true
}

// select相關
const selectModel = ref<string>('')

const selectArray = [
  {
    value: '',
    label: '全部'
  },
  {
    value: 'is_active=false',
    label: '已删除'
  },
  {
    value: 'is_active=true',
    label: '未删除'
  }
]
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
.TableArea {
  margin: 40px;
}
</style>
