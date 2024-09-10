const Pair: { [key: string]: string }[] = [] // 定义 Pair 是一个对象数组
// 由于reader.onload为异步，整个模块成了异步
export default async function uploadCSV(file: File): Promise<{ [key: string]: string }[]> {
  Pair.length = 0
  await splitData(file)
  return Pair
}

async function splitData(file: File): Promise<void> {
  const reader = new FileReader()
  return new Promise<void>((resolve, reject) => {
    reader.onload = (e) => {
      parseCSV(e.target!.result as string)
      resolve()
    }
    reader.onerror = reject // 回调函数的触发
    reader.readAsText(file)
  })
}

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/) // 每行一个数组 // \r\n 是Windows系统中的标准换行符，\n 是Unix和Linux系统中的标准换行符。
  const headers = lines[0].split(',')
  for (let i = 1; i < lines.length; i++) {
    const fields = spiltString(lines[i]).map((field) => field.trim())
    const entry: { [key: string]: string } = {}
    fields.forEach((field, index) => {
      if (field[0] === '"' && field[-1] === '"') {
        field = field.slice(1, -1)
      }
      entry[headers[index]] = field // 直接在对象中设置属性
    })
    Pair.push(entry) // 将对象添加到 Pair 数组中
  }
}

const spiltString = (str: string) => {
  const rData: string[] = []
  let tmpstack = ''
  let tmpSingle = false
  let tmpDouble = false

  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '"':
        tmpDouble = !tmpDouble
        break
      case "'":
        tmpSingle = !tmpSingle
        break
      case ',':
        if (!tmpSingle && !tmpDouble) {
          rData.push(tmpstack)
          tmpstack = ''
          continue // 下一个i
        }
    }
    tmpstack += str[i]
  }
  rData.push(tmpstack)
  return rData
}
