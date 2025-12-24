import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <Link href="/home/kun" className="cursor-pointer text-blue-500">跳转kun</Link><br />
      <Link href={{ pathname:"/home/me", query: { name: ["kun", 'kun2'] } }} className="cursor-pointer text-red-500">跳转me, 并携带参数</Link><br />
      <Link href={{ pathname:"/home/me", }} prefetch={true} className="cursor-pointer text-red-500">预获取页面</Link><br />
      <Link href={{ pathname:"/home/me"}} scroll={true} className="cursor-pointer text-blue-500">保持当前滚动位置</Link><br />
      <Link href={{ pathname:"/home/me"}} replace={true} className="cursor-pointer text-red-500">替换当前路由</Link>
    </div>
  )
}
