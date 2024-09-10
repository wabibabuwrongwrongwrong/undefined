export interface contents {
  count: number
  next: string
  previous: string
  result: any
}

class splitPage {
  input: any
  ShowResult: any[][]
  MaxPage: number
  constructor(input: any) {
    this.input = input
    this.ShowResult = [[]]
    this.MaxPage = 1
    this._SplitPage()
  }

  private _SplitPage() {
    const temp = Object.values(this.input.content) as unknown as contents
    console.log('origin:split temp:', temp)
    this.MaxPage = Math.ceil(temp[0] / 10) // 分頁單頁顯示 10條項目
    this.ShowResult = Array.from({ length: this.MaxPage }, () => [])
    temp[3].forEach((e, index) => {
      this.ShowResult[Math.floor(index / 10)].push(e)
    })
    console.log('showResultPa', this.ShowResult)
  }
}

// input為含有題目集合的網絡請求包
// 0-  "count": 198,
// 1-  "next": "???/api/v1/reviews/?page=2",
// 2-  "previous": null,
// 3-  "results"
export function ArrayifyPageData(input: any) {
  return (Object.values(input.content) as unknown as contents)[3]
}

export default splitPage
