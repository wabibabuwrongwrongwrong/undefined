<template>
  <div class="canvas clearfix" :key="TableRefreshKey" v-loading="isLoading">
    <div class="LeftPage leftfix">
      <!-- 左边框-->
      <div class="topicPart">
        <span style="font-size: 32px; font-weight: bold">知识点：</span>
        <!-- <br /> -->
        <!-- <div style="margin-left: 20px">
          <span>{{ topictoString }}</span>
        </div> -->
        <!-- <span style="margin-right: 40px">&nbsp;</span> -->
        <el-select
          v-model="topicRef"
          :placeholder="topictoString"
          size="large"
          style="width: 260px; margin-right: 50px"
          class="rightfix"
        >
          <el-option
            v-for="item in topicsList"
            :label="item.title"
            :value="item.id"
            :key="item.id"
            style="font-size: larger"
          />
        </el-select>
      </div>
      <div class="problem">
        <h1>题目：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="exerciseInfo?.title"></LatexRender>
        </div>
      </div>
      <div class="description">
        <h1>过程：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="exerciseInfo?.explanation"></LatexRender>
        </div>
      </div>
      <div class="answer circleBar">
        <h1>答案：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="exerciseInfo?.answer"></LatexRender>
        </div>
      </div>
    </div>
    <div class="RightPage leftfix">
      <div class="imagePart">
        <div class="Blackline"></div>
        <div class="Blackline"></div>
        <img :src="imagePathRef" alt="exercise image" :width="700" class="imageQuestion" />
      </div>

      <!-- <div v-if="exerciseInfo?.title" class="commentPart circleBar">
        <span>题目修正区</span>
        <el-input
          v-model="commentRef"
          maxlength="400"
          style="font-size: 20px; width: 500px"
          :autosize="{ minRows: 7 }"
          :placeholder="titleRef"
          show-word-limit
          size="large"
          type="textarea"
        />
      </div>
      <div v-else class="commentPart circleBar">
        <el-input
          v-model="commentRef"
          maxlength="400"
          style="font-size: 20px; width: 500px"
          :autosize="{ minRows: 7 }"
          placeholder="题目修正区"
          show-word-limit
          size="large"
          type="textarea"
        />
      </div> -->
      <div class="commentPart circleBar">
        <div><h2>题目修正区:</h2></div>
        <el-input
          v-model="commentRef"
          maxlength="600"
          style="font-size: 20px; width: 600px; margin-top: 3px"
          :autosize="{ minRows: 4, maxRows: 6 }"
          :placeholder="titleRef"
          show-word-limit
          size="large"
          type="textarea"
        />
      </div>
      <div class="commentPart circleBar">
        <div><h2>过程修正区:</h2></div>
        <el-input
          v-model="ExplanationRef"
          maxlength="600"
          style="font-size: 20px; width: 600px; margin-top: 3px"
          :autosize="{ minRows: 4, maxRows: 6 }"
          :placeholder="DefaultExplanation"
          show-word-limit
          size="large"
          type="textarea"
        />
      </div>
      <div class="commentPart circleBar">
        <div><h2>答案修正区:</h2></div>
        <el-input
          v-model="AnswerRef"
          maxlength="600"
          style="font-size: 20px; width: 600px; margin-top: 3px"
          :autosize="{ minRows: 2, maxRows: 3 }"
          :placeholder="DefaultAnswer"
          show-word-limit
          size="large"
          type="textarea"
        />
      </div>

      <div class="buttonPart circleBar">
        <span style="padding-left: 30px">
          <el-button
            type="success"
            @click="AcceptQuestion"
            :loading="isLoading"
            size="large"
            style="font-size: 20px"
            ><Select />提交修改</el-button
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const what = ref('')
import {
  getExercisesByID,
  getExercisesByPage,
  getExercises,
  patchExercisesByID
} from '@/api/exercises'
import { getTopics, getTopicsByID, getTopicsByPage } from '@/api/topics'

import LatexRender from '@/components/TexDeal/LatexRender.vue'
import { Select, CloseBold } from '@element-plus/icons-vue'
import ExercisesRevise from './exercisesRevise.vue'
import { ArrayifyPageData } from '@/api/splitPage'
// import { ElMessage, ElMessageBox } from 'element-plus' 不要多重引用，部分组件采用了全局引用，报错了再考虑按需引用

interface Exercise {
  id: number
  exercise: number | string
  result: string | null
  comments: string | null
  created_date: string
  title: string
  image_path: string | null
  topic: string | number
  [key: string]: any // 索引签名，允许任何额外的属性
}

const titleRef = ref()
// const explanationRef = ref()
// const answerRef = ref()
// const imagePathRef = ref()
// const exerciseId = ref()

const exerciseInfo = ref<Exercise>()
const topictoString = ref<string>()
const imagePathRef = ref()
const commentRef = ref<string>('')
const TableRefreshKey = ref(0)

const ExplanationRef = ref()
const DefaultExplanation = ref<string>('')
const AnswerRef = ref()
const DefaultAnswer = ref<string>('')
const topicRef = ref()
// 存储topic类型为：number
onMounted(async () => {
  await checkTopicsList()

  const ExercisesId = new URLSearchParams(window.location.search).get('ExercisesID')

  // const { id, comments, title, explanation, answer, image_path } = (
  //   await getExercisesByID(ExercisesId!)
  // ).content as unknown as Review

  exerciseInfo.value = (await getExercisesByID(ExercisesId!)).content as unknown as Exercise
  console.log(exerciseInfo.value, 'see me!')
  topictoString.value = ((await getTopicsByID(exerciseInfo.value.topic + '')).content as any).title
  console.log('tmp', topictoString.value)
  let tmp = exerciseInfo.value.image_path!.replace(/\\/g, '/') as string
  imagePathRef.value = new URL(`src/../static/image/${tmp}`, window.location.origin).href
  commentRef.value = exerciseInfo.value.title ? exerciseInfo.value.title : ''
  titleRef.value = exerciseInfo.value.title

  ExplanationRef.value = exerciseInfo.value.explanation ? exerciseInfo.value.explanation : ''
  DefaultExplanation.value = exerciseInfo.value.explanation
  AnswerRef.value = exerciseInfo.value.answer ? exerciseInfo.value.answer : ''
  DefaultAnswer.value = exerciseInfo.value.answer

  TableRefreshKey.value += 1

  // const { title, explanation, answer, image_path } = (await getExercisesByID(exercise + ''))
  //   .content as unknown as Review

  // exerciseId.value = id + '' // 转string
  // explanationRef.value = explanation
  // answerRef.value = answer
  // // imagePathRef.value = image_path

  // let tmp = image_path!.replace(/\\/g, '/') as string
  // imagePathRef.value = new URL(`src/../static/image/${tmp}`, window.location.origin).href
  // TableRefreshKey.value += 1
})

const isLoading = ref(false)
const AcceptQuestion = async () => {
  isLoading.value = true
  const tmpExerciseInfo = {
    topic: topicRef.value,
    title: commentRef.value,
    explanation: ExplanationRef.value,
    answer: AnswerRef.value
  }
  try {
    await patchExercisesByID((exerciseInfo.value as any).id, tmpExerciseInfo)
    console.log('Status updated success')
    ElMessageBox.alert('\t结果已上传', '系统提示', {
      confirmButtonText: 'OK'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    ElMessageBox.alert('\t结果上传失败，请重新上传', '系统提示', {
      confirmButtonText: 'OK'
    })
  }
  isLoading.value = false
}

interface Topics {
  title?: string
  [key: string]: any
}
const topicsList = ref([]) as Topics // 存放题目类型列表
// 更新可选题目知识点
const elementsArray = ref([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
const checkTopicsList = async (page?: string) => {
  let tmp = page ? await getTopicsByPage(page) : await getTopics()
  console.log(page, 'page')
  topicsList.value = ArrayifyPageData(tmp).map((e) => ({
    title: e?.title,
    id: e?.id
  }))
  topicsList.value.forEach((e, index) => {
    elementsArray.value[index] = e
  })

  console.log('GeTtopicsList', topicsList.value)
}
</script>

<style scoped>
.canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 25px;
  background-color: #f6f8fa;
}
.LeftPage {
  width: 45%;
}
.Blackline {
  border: 2px solid #f6f8fa;
  margin: 5px 70px;
}
div .Blackline:nth-child(2) {
  margin-bottom: 20px;
}
.imagePart {
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 30px 30px;
  padding-bottom: 30px;
  border-bottom: solid 2px #e5e7eb;
}
.imageQuestion {
  max-width: 100%;
  height: auto;
}

.topicPart {
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-bottom: 0;
  padding: 50px 30px;
  padding-top: 40px;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
}
.problem {
  background-color: #fcfcfd;
  border: 2px solid #e5e7eb;
  padding: 50px 30px;
  padding-top: 40px;
  /* border-top-left-radius: 40px;
  border-top-right-radius: 40px; */
}
.description {
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-top: 0px;

  padding: 30px 30px;
  padding-bottom: 60px;
}

.RightPage {
  margin-left: 40px;
  width: 50%;
  font-size: 1.21em;
}

.circleBar {
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 40px;
  padding: 30px 30px;
  border-bottom: solid 2px #e5e7eb;
}

.answer {
  padding-left: 50px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-top: 0px;
  background-color: #fcfcfd;
}
.state {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  background-color: #ffffff;
  padding-left: 50px;
}
.stateShow {
  font-weight: bold;
  font-size: 1.42em;
}
.iconDelta {
  position: absolute;
  top: 10px;
}
.commentPart {
  border-radius: 0px;
  border-top: 0;
  padding-left: 50px;
  padding-right: 50px;
  background-color: #fcfcfd;
}
.buttonPart {
  background-color: #fcfcfd;
  border-top: 0px;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
}

.review-page-container {
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.text-center {
  text-align: center;
}

.content-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.picture,
.text {
  width: 45%;
  background-color: rgb(191, 232, 255);
  border: 2px solid rgb(129, 129, 255);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  width: 600px;
  /* height: 400px; */
}

.picture img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

h2 {
  margin-bottom: 10px;
}

.buttons {
  display: flex;
  justify-content: space-around;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-success {
  background-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

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
</style>
