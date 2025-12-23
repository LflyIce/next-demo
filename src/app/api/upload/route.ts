import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 从请求中解析 FormData 数据（包含上传的文件）
    const formData = await request.formData();
    // 从 FormData 中获取名为 'image' 的文件，并断言为 File 类型
    const file = formData.get('image') as File;
    
    // 如果文件不存在，返回 400 错误响应
    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 将文件转换为 ArrayBuffer（二进制数据数组）
    const bytes = await file.arrayBuffer();
    // 将 ArrayBuffer 转换为 Node.js Buffer 对象，便于文件操作
    const buffer = Buffer.from(bytes);

    // 拼接目标路径 'src/images'，并递归创建目录（如不存在）
    const imagesDir = path.join(process.cwd(), 'src', 'images');
    await mkdir(imagesDir, { recursive: true });

    // 生成唯一文件名（时间戳 + 原文件名）
    const fileName = `${Date.now()}-${file.name}`;
    // 拼接完整文件路径
    const filePath = path.join(imagesDir, fileName);

    // 将 Buffer 数据写入文件系统
    await writeFile(filePath, buffer);

    // 返回成功响应，包含文件访问路径
    return NextResponse.json({ 
      success: true, 
      path: `/images/${fileName}` 
    });
  } catch (error) {
    // 捕获异常，记录日志并返回 500 错误响应
    console.error('上传错误:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
