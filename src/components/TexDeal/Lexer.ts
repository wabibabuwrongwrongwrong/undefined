export interface Token {
  type: string
  value: any
}

class Lexer {
  input: string
  #position: number
  #currentChar: string | null
  #stack: string
  #mode: string
  TokenList: Token[]
  constructor(input: string) {
    this.input = input
    this.#position = 0
    this.#currentChar = this.input[this.#position] || null
    this.#stack = ''
    this.#mode = 'TEXT' // TEXT or MATH
    this.TokenList = []
    this._GetSpilt()
  }
  //input接收原始latex字符串，依次遍历字符并加入到stack中
  // 识别到MATH/TEXT切换符号时，直接把stack的字符串以token.value存储到TokenList，清空stack
  // 当前切换符号包括{ '\[',  '\]',  '$'   }

  public destroy() {
    this.TokenList.length = 0
    this.TokenList = []
  }

  private _GetSpilt() {
    while (this.#currentChar) {
      this.#currentChar = this.input[this.#position]
      this.#stack += this.#currentChar ? this.#currentChar : '' // 当前字符放入堆栈
      switch (this.#currentChar) {
        case '[':
          if (this.#stack.slice(-2) === '\\[') {
            if (this.#mode === 'MATH') console.log('Eroor! too many nested Latex Mode!')
            this.TokenList.push({ type: 'TEXT', value: this.#stack.slice(0, -2) })
            this.TokenList.push({ type: 'L_BRACKET', value: '\\[' })
            this.#stack = ''
            this.#mode = 'MATH'
          }
          break
        case ']':
          if (this.#stack.slice(-2) === '\\]') {
            // console.log('识别\\]')
            if (this.#mode === 'TEXT') console.log('Eroor! too many nested Latex Mode!')
            this.TokenList.push({ type: this.#mode, value: this.#stack.slice(0, -2) }) // 之前识别的字符串为text
            this.TokenList.push({ type: 'R_BRACKET', value: '\\]' })
            this.#stack = ''
            this.#mode = 'TEXT'
          }
          break
        case '$':
          // console.log('识别$号')
          this._DealDOLLER()
          break
        default:
          break
      }
      this.#position++
    }
    if (this.#stack !== '') {
      this.TokenList.push({ type: this.#mode, value: this.#stack }) // 处理纯文本
    }
    // console.log('spilt Fin', this.TokenList)
  }

  private _DealDOLLER() {
    if (this.#mode === 'MATH') {
      if (this.#stack.length > 1) {
        this.TokenList.push({ type: 'MATH', value: this.#stack.slice(0, -1) }) // 单独处理新加的$即可
      } // 防止value为''空字符
      this.TokenList.push({ type: 'R_DOLLER', value: '$' })
      this.#stack = ''
      this.#mode = 'TEXT'
      return
    }

    if (this.#mode === 'TEXT') {
      if (this.#stack.length > 1) {
        this.TokenList.push({ type: 'TEXT', value: this.#stack.slice(0, -1) }) // 单独处理新加的$即可
      }
      this.TokenList.push({ type: 'L_DOLLER', value: '$' }) // 进入数学模式的左doller
      this.#stack = ''
      this.#mode = 'MATH'
      return
    }
  }
}

export default Lexer
