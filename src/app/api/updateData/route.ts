import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 定义 JSON 文件路径
    const filePath = path.join(process.cwd(), 'src', 'app', 'statisticalTable', 'data.json');
    
    // 写入文件
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: '数据更新成功' });
  } catch (error) {
    console.error('更新数据错误:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
