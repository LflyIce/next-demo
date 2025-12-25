'use client'
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function MePage() {

  // 获取路由传递的参数
  const searchParams = useSearchParams()
  const name = searchParams.get("name")
  const names = searchParams.getAll("name")
  console.log('传递的参数：', name)
  console.log('传递的多个参数：', names)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h1>Me</h1>
        <Link href="/home/kun">Kun</Link>
      </div>
    </Suspense>
  )
    
}
