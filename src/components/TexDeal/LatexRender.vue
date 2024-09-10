<template>
  <span v-for="el in elements" :key="el.id">
    <span v-if="el.type === 'TEXT'" class="TextInLatex">{{ el.content }}</span>
    <span v-else-if="el.type === 'MATH'" v-html="el.content"></span>
  </span>
</template>

<script setup lang="ts">
import 'katex/dist/katex.min.css'
import katex from 'katex'
import Lexer from '@/components/TexDeal/Lexer'
const props = defineProps<{
  expr: string | null | undefined
}>()

//  ------------將expr拆分成text和expr----------------  //
interface DOM {
  id: number
  type: string
  content: string
}
const elements = ref<DOM[]>([]) // 响应式数组存储分割文本

// const macros ={
//   // 等交流原始latex后再考虑修改
//   // "\\newline": "\\mathbb{R}",

// };
if (typeof props.expr === 'string') {
  const lexer = new Lexer(props.expr)
  elements.value = lexer.TokenList.map((token, index) => ({
    id: index,
    type: token.type,
    content:
      token.type === 'MATH'
        ? katex.renderToString(token.value, {
            throwOnError: false,
            displayMode: false
            // macros：macros
          })
        : token.value
  }))
  lexer.destroy()
  // console.log('success read Tex', elements)
}
</script>

<style scoped lang="scss">
.TextInLatex {
  font-size: 1.21em;
}
</style>
