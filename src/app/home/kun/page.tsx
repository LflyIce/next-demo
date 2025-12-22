import Link from "next/link"

const getData = async () => {
        //触发异步会自动跳转到loading组件 异步结束正常返回页面
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("数据")
            }, 5000)
        })
    }
export default async function KunPage() {

    const data = await getData()

  return(
    <div>
         <div>Kun</div>
         <Link href="/home/me">ME</Link>
    </div>
  )
}
