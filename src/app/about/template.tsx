'use client'

import { useState } from "react"

export default function TemplePage({ children }: { children: React.ReactNode }) {
    const [count, setCount] = useState(0)
    return (<div>
        <header>Temple</header>
        <button onClick={() => setCount((count) => count + 1)}>{count}</button>
        {children}
    </div>)
}
