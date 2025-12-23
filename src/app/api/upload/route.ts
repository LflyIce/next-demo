import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 创建 images 目录
    const imagesDir = path.join(process.cwd(), 'src', 'images');
    await mkdir(imagesDir, { recursive: true });

    // 生成文件名
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(imagesDir, fileName);

    // 保存文件
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      path: `/images/${fileName}` 
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
