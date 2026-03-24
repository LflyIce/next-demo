import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 禁用 SSL 证书验证 (开发环境)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 获取所有商品类别
export async function GET(request: NextRequest) {
  try {
    const { rows } = await pool.query(`
      SELECT class_id as "classId", class_name as "className"
      FROM info_item_class
      ORDER BY class_id ASC
    `);
    
    return NextResponse.json({
      data: rows,
      success: true
    });
  } catch (error) {
    console.error('获取商品类别错误:', error);
    return NextResponse.json({ data: [], success: false }, { status: 200 });
  }
}

// 新增商品类别
export async function POST(request: NextRequest) {
  try {
    const { className } = await request.json();
    
    if (!className) {
      return NextResponse.json({ error: '类别名称不能为空' }, { status: 400 });
    }
    
    const { rows } = await pool.query(`
      INSERT INTO info_item_class (class_name)
      VALUES ($1)
      RETURNING class_id as "classId", class_name as "className"
    `, [className]);
    
    return NextResponse.json({ 
      success: true, 
      message: '添加成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('添加商品类别错误:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
