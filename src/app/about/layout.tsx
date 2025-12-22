'use client'
import { Button } from "antd"
import Link from "next/link"
import { useState } from "react"

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    
    const [count, setCount] = useState(0)
  return (
    <div>
        <header>AboutLayout</header>
        <Button onClick={() => setCount((count) => count + 1)} type="primary">{count}</Button>
        {children}

        <hr />
        <Link href="about/review">Review</Link><br />
        <Link href="/about">About</Link>
    </div>
  )
}
