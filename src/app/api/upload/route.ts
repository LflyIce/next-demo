import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 在 Vercel 环境中，使用 base64 编码返回图片
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      path: dataUrl
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
