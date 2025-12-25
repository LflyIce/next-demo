import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 使用 Vercel Blob 存储
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ 
      success: true, 
      path: blob.url
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
