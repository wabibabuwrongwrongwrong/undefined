<template>
  <div class="csvPage clearfix">
    <div class="leftPage circleBar leftfix">
      <div class="FileButton clearfix">
        <div class="leftfix" style="align-items: center; padding: 5px 15px">
          <label for="file">上传CSV文件</label>
          <input
            type="file"
            accept=".csv"
            id="file"
            @change="handleFileChange"
            style="margin-left: 8px"
          />
        </div>

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
              一键选择全部题目知识点
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
                @click=""
              >
                <template #default="scope">
                  <el-icon style="margin-top: 3px; margin-right: 7px"><ArrowRightBold /></el-icon>
                  <el-button @click="selectDefaultTopic(scope.row['column' + colIndex]?.id)">
                    {{ scope.row['column' + colIndex].title }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-model:current-page="currentPage"
              layout="prev, pager, next"
              :total="10"
              @current-change="handleCurrentChange"
              class="rightfix"
            />
          </div>
        </el-popover>
      </div>

      <div class="alertbox" style="visibility: hidden" id="alertbox">
        文件大小超出{{ MaxSize }}KB,请重新上传
      </div>
      <div class="Blackline"></div>

      <el-table
        ref="thisRefTable"
        :data="csvData"
        style="width: 100%; text-align: center; font-size: 17px"
        table-layout="fixed"
      >
        <!-- @selection-change="handleSelectionChange" -->
        <el-table-column type="index" label="序号" width="80px" />
        <el-table-column property="source" label="题目编号" />
        <el-table-column property="path" label="路徑" />
        <el-table-column label="题目类型">
          <template #default="scope" :key="IndexRefreshKey">
            <el-select
              v-model="topicIndexArr[scope.$index].id"
              placeholder="选择知识点"
              size="large"
              style="width: 240px"
              v-if="topicIndexArr"
            >
              <el-option
                v-for="item in topicsList"
                :label="item.title"
                :value="item.id"
                :key="item.id"
                style="font-size: larger"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <div class="buttonArea clearfix">
        <el-button
          type="success"
          @click="toggleSelectionUpload()"
          class="rightfix uploadbutton"
          size="large"
          :loading="isLoading"
          ><span style="font-size: 25px">上传题目</span></el-button
        >
      </div>
    </div>

    <!-- <div
      class="rightRage circleBar leftfix clearfix"
      style="height: 200px; background-color: lightblue"
    >
      <div
        style="border: 3px solid green; width: 380px; height: 200px; float: left"
        class="leftfix"
      >
        {{ topicsList }}
      </div>
      <div
        style="border: 3px solid green; width: 180px; height: 200px; float: left"
        class="leftfix"
      >
        {{ topicIndexArr }}
      </div>
      <div
        style="border: 3px solid green; width: 380px; height: 200px; float: left"
        class="leftfix"
      >
        {{ csvData }}
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import uploadCSV from '@/views/uploadCSV'
import { ElTable, ElTableColumn, ElButton } from 'element-plus'
import { getTopics, getTopicsByPage } from '@/api/topics'
import { postExercises, type ExerciseInfo, getExercises } from '@/api/exercises'
import { ArrayifyPageData } from '@/api/splitPage'
import { ArrowRightBold } from '@element-plus/icons-vue'
const elementsArray = ref([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

// 将10个元素格式化为2行5列的表格数据
const formattedTableData = computed(() => {
  const i = 2
  const rows = 5
  // console.log(elementsArray, 'see eleArray now')
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

interface Topics {
  title?: string
  [key: string]: any
}

interface CSVDATA {
  [key: string]: string | number
}
const IndexRefreshKey = ref()
const topicsList = ref([]) as Topics // 存放题目类型列表
const topicIndexArr = ref<Topics[]>([]) // 存放下拉框选择的数组，每有一行题目生成一个对象存放当前题目选择的题目类型
const MaxSize = ref(64) // 上傳文件最大尺寸(KB)

const popoverVisible = ref(false) // 可视化泡泡框

// button区函数
//
const thisRefTable = ref<InstanceType<typeof ElTable>>()

const isLoading = ref(false)
const toggleSelectionUpload = async (rows?: CSVDATA[]) => {
  isLoading.value = true
  if (csvData === null || csvData === undefined) {
    isLoading.value = false
    return
  }
  for (let i = 0; i < csvData.value.length; i++) {
    uploadExercise(i)
  }
  isLoading.value = false
}

const selectDefaultTopic = (id?: number) => {
  if (id) {
    topicIndexArr.value.forEach((e) => {
      e.id = id
    })
    console.log(id)
    console.log(topicIndexArr)
    popoverVisible.value = false
  } else {
    return
  }
}

// 00-首次挂载组件刷新topicslist
//
onMounted(async () => {
  await checkTopicsList()
})

// 01-文件上传网页，进行解析
//
const csvData = ref<CSVDATA[]>([]) //存放所有读取的数据
const handleFileChange = async (event) => {
  document.getElementById('alertbox')!.style.visibility = 'hidden'
  const file = event.target.files[0]
  if (file.size / 1024 > MaxSize.value) {
    // 大于64KB
    file.value = null
    document.getElementById('alertbox')!.style.visibility = 'visible'
    return
  }
  csvData.value = (await uploadCSV(file)).filter((item) => (item.source ? item : null)) // 留下非空属性；使用filter强制唤起数组csvData响应进而渲染页面
  // console.log('csvData', csvData.value)
  await checkTopicsList()
  reRenderTable(csvData.value.length)
  await nextTick() // 等待 DOM 更新
}

// 更新可选题目知识点
const checkTopicsList = async (page?: string) => {
  let tmp = page ? await getTopicsByPage(page) : await getTopics()
  topicsList.value = ArrayifyPageData(tmp).map((e) => ({
    title: e?.title,
    id: e?.id
  }))
  topicsList.value.forEach((e, index) => {
    elementsArray.value[index] = e
  })

  // console.log('GeTtopicsList', topicsList.value)
}

// 01-01上传文件解析内容，更新表格，重新赋值辅助数组topicIndexArr
const reRenderTable = (len: number) => {
  topicIndexArr.value = []
  for (let i = 0; i < len; i++) {
    topicIndexArr.value.push({ title: '', id: 1 }) //置入空字符串进行占位
  }
  // console.log(topicIndexArr, topicsList)
  if (topicsList && topicIndexArr) {
    IndexRefreshKey.value += 1 //  强制渲染
  }
}

// 02-网络提交题目
//
const uploadExercise = async (index: number) => {
  // console.log('nowData:', csvData.value[index])
  //
  // 添加题目校验path
  //
  csvData.value[index].topic = topicIndexArr.value[index].id
  csvData.value[index].explanation = csvData.value[index].explanation
    ? csvData.value[index].explanation
    : csvData.value[index].explain
  csvData.value[index].image_path = csvData.value[index].image_path
    ? csvData.value[index].image_path
    : csvData.value[index].path
  try {
    let tmp1 = await postExercises(csvData.value[index] as unknown as ExerciseInfo)
    console.log('tmp1', tmp1)
    tmp1.success === true ? uploadSuccess() : uploadFailed()
  } catch (e) {
    console.error(e)
    uploadFailed()
  }
}
const uploadSuccess = () => {
  ElMessage({
    showClose: true,
    message: '上传成功',
    grouping: true,
    type: 'success'
  })
}
const uploadFailed = () => {
  // ElMessage.error('Oops, this is a error message.')
  ElMessage({
    showClose: true,
    message: '上传失败',
    grouping: true,
    type: 'error'
  })
}

// 03- 切换知识点分页
//
const currentPage = ref(1)
const handleCurrentChange = async (val: number) => {
  await SwitchPage(val + '')
  // console.log(`current page: ${val}`)
}
const SwitchPage = async (page: string) => {
  for (const [index, e] of ArrayifyPageData(await getTopicsByPage(page)).entries()) {
    elementsArray.value[index] = e
  }
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
.Blackline {
  border: 2px solid #f6f8fa;
  margin: 5px 0px 10px 0px;
}
.leftPage {
  width: 90%;
  padding: 30px;
  margin-top: 40px;
  margin-left: 40px;
}
.rightRage {
  width: 80%;
  //   padd ing: 30px;
  margin: 40px;
}

:deep(.el-table__body td) {
  padding: 5px 0px; /* 增加单元格内部的填充 */
}
:deep(.el-table th.is-leaf) {
  border: none;
  padding: 10px 0px;
}
.buttonArea {
  padding: 10px;
}
.clearbutton,
.uploadbutton {
  margin-top: 20px;
  margin-left: 20px;
}

.popoBox {
  padding-top: 0px;
  padding-left: 15px;
  width: 100%;
  height: 350px;
}
</style>
