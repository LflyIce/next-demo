'use client'

import { useParams } from "next/navigation"


export default function UserPage() {
  // 获取路由参数
  const params = useParams()
  console.log(params)
  const { id } = params

  return (
    <div>UserPage
      <p>传递的参数：{id}</p>
    </div>
  )
}