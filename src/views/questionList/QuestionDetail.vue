<template>
  <div class="canvas clearfix" :key="TableRefreshKey" v-loading="isLoading">
    <div class="LeftPage leftfix">
      <!-- 左边框-->
      <div class="problem">
        <h1>题目：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="titleRef"></LatexRender>
        </div>
      </div>
      <div class="description">
        <h1>过程：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="explanationRef"></LatexRender>
        </div>
      </div>
      <div class="answer circleBar">
        <h1>答案：</h1>
        <br />
        <div style="margin-left: 20px">
          <LatexRender :expr="answerRef"></LatexRender>
        </div>
      </div>
    </div>
    <div class="RightPage leftfix">
      <div class="imagePart">
        <div class="Blackline"></div>
        <div class="Blackline"></div>
        <img :src="imagePathRef" alt="exercise image" :width="700" class="imageQuestion" />
      </div>

      <div class="commentPart circleBar">
        <el-input
          v-model="commentRef"
          maxlength="200"
          style="font-size: 20px; width: 500px"
          :autosize="{ minRows: 7 }"
          placeholder="审核注释"
          show-word-limit
          size="large"
          type="textarea"
        />
        <!-- <el-input placeholder="what???" v-model="what" /> -->
      </div>
      <div class="buttonPart circleBar">
        <span style="padding-left: 30px">
          <el-button
            type="success"
            @click="AcceptQuestion"
            :loading="isLoading"
            size="large"
            style="font-size: 20px"
            ><Select />通过</el-button
          >
          <el-button
            type="danger"
            @click="RefuzeQuestion"
            :loading="isLoading"
            size="large"
            style="font-size: 20px"
            ><CloseBold />不通过</el-button
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const what = ref('')
import { getExercisesByID } from '@/api/exercises'
import { getReviewsByID, patchReviewsByID } from '@/api/reviews'
import LatexRender from '@/components/TexDeal/LatexRender.vue'
import { Select, CloseBold } from '@element-plus/icons-vue'
// import { ElMessage, ElMessageBox } from 'element-plus' 不要多重引用，部分组件采用了全局引用，报错了再考虑按需引用

interface Review {
  id: number
  exercise: number | string
  result: string | null
  comments: string | null
  created_date: string
  title: string
  [key: string]: any // 索引签名，允许任何额外的属性
}

const titleRef = ref()
const explanationRef = ref()
const answerRef = ref()
const imagePathRef = ref()
const commentRef = ref<string>('')
const TableRefreshKey = ref(0)
const exerciseId = ref()

onMounted(async () => {
  const reviewId = new URLSearchParams(window.location.search).get('ReviewId')

  const { exercise, comments } = (await getReviewsByID(reviewId!)).content as unknown as Review
  const { title, explanation, answer, image_path } = (await getExercisesByID(exercise + ''))
    .content as unknown as Review
  exerciseId.value = exercise + '' // 转string
  titleRef.value = title
  explanationRef.value = explanation
  answerRef.value = answer
  // imagePathRef.value = image_path
  commentRef.value = comments ? comments : commentRef.value

  let tmp = image_path!.replace(/\\/g, '/') as string
  imagePathRef.value = new URL(`src/../static/image/${tmp}`, window.location.origin).href
  TableRefreshKey.value += 1
})

// STATUS_CHOICES = [
//         ('P', 'Pending'),
//         ('A', 'Approved'),
//         ('R', 'Rejected')
//     ]
const AcceptQuestion = () => {
  updateStatus('A')
}
const RefuzeQuestion = () => {
  updateStatus('R')
}

const isLoading = ref(false)
const updateStatus = async (newStatus: string) => {
  isLoading.value = true
  const tmpExerciseInfo = {
    comments: commentRef.value,
    result: newStatus
  }
  try {
    await patchReviewsByID(exerciseId.value, tmpExerciseInfo)
    console.log('Status updated success', newStatus)
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
  width: 50%;
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

.problem {
  background-color: #fcfcfd;
  border: 2px solid #e5e7eb;
  padding: 50px 30px;
  padding-top: 40px;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
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
  width: 45%;
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
