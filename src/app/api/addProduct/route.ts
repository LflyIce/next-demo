import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const newProduct = await request.json();
    
    // 读取现有数据
    const filePath = path.join(process.cwd(), 'src', 'app', 'statisticalTable', 'data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const existingData = JSON.parse(fileContent);
    
    // 添加新商品
    existingData.push(newProduct);
    
    // 写入文件
    await writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: '添加成功' });
  } catch (error) {
    console.error('添加商品错误:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
