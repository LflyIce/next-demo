import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 存储到 Vercel KV
    await kv.set('products', JSON.stringify(data));
    
    return NextResponse.json({ success: true, message: '数据更新成功' });
  } catch (error) {
    console.error('更新数据错误:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await kv.get('products');
    return NextResponse.json(data ? JSON.parse(data as string) : []);
  } catch (error) {
    console.error('获取数据错误:', error);
    return NextResponse.json([], { status: 200 });
  }
}
