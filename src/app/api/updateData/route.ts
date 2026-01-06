import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 禁用 SSL 证书验证 (开发环境)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 设置运行时配置，增加超时时间
export const maxDuration = 60;

// 创建数据库连接池 - 使用 NON_POOLING URL 避免 SSL 问题
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 更新或插入单条数据
export async function POST(request: NextRequest) {
  try {
    const item = await request.json();
    
    await pool.query(`
      INSERT INTO info_item (
        id, image_url, name, skc, model, link, price, min_price, 
        shipping, platform_subsidy, new_discount, flash_discount, 
        purchase_cost, packing_cost, profit, status, create_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (id) DO UPDATE SET
        image_url = EXCLUDED.image_url,
        name = EXCLUDED.name,
        skc = EXCLUDED.skc,
        model = EXCLUDED.model,
        link = EXCLUDED.link,
        price = EXCLUDED.price,
        min_price = EXCLUDED.min_price,
        shipping = EXCLUDED.shipping,
        platform_subsidy = EXCLUDED.platform_subsidy,
        new_discount = EXCLUDED.new_discount,
        flash_discount = EXCLUDED.flash_discount,
        purchase_cost = EXCLUDED.purchase_cost,
        packing_cost = EXCLUDED.packing_cost,
        profit = EXCLUDED.profit,
        status = EXCLUDED.status,
        create_time = EXCLUDED.createTime
    `, [
      item.key, item.image || '', item.name, item.skc, item.model,
      item.link, item.price, item.minPrice, item.shipping,
      item.platformSubsidy, item.newDiscount, item.flashDiscount,
      item.purchaseCost, item.packingCost, item.profit, item.status, item.createTime
    ]);
    console.log('数据更功:', pool);
    
    return NextResponse.json({ success: true, message: '数据更新成功' });
  } catch (error) {
    console.error('更新数据错误:', error);
    console.log('错误:', String(error))
    return NextResponse.json({ error: '更新失败', details: String(error) }, { status: 500 });
  }
}

// 删除单条数据
export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    await pool.query('DELETE FROM info_item WHERE id = $1', [key]);
    
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除数据错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

// 查询所有数据（支持分页和筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const name = searchParams.get('name') || '';
    const status = searchParams.get('status');
    const timeRange = searchParams.get('timeRange');
    
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;
    
    // 名称筛选
    if (name) {
      whereConditions.push(`name ILIKE $${paramIndex}`);
      params.push(`%${name}%`);
      paramIndex++;
    }
    
    // 状态筛选
    if (status !== null && status !== '') {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(parseInt(status));
      paramIndex++;
    }
    
    // 时间筛选
    if (timeRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (timeRange === 'today') {
        whereConditions.push(`create_time >= $${paramIndex}`);
        params.push(today.toISOString());
        paramIndex++;
      } else if (timeRange === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        whereConditions.push(`create_time >= $${paramIndex} AND create_time < $${paramIndex + 1}`);
        params.push(yesterday.toISOString(), today.toISOString());
        paramIndex += 2;
      } else if (timeRange === 'last3days') {
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        whereConditions.push(`create_time >= $${paramIndex}`);
        params.push(threeDaysAgo.toISOString());
        paramIndex++;
      }
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    // 查询总数
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM info_item ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);
    
    // 查询分页数据
    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);
    
    const { rows } = await pool.query(`
      SELECT 
        id as key, image_url as image, name, skc, model, link, price, 
        min_price as "minPrice", shipping, 
        platform_subsidy as "platformSubsidy", 
        new_discount as "newDiscount", 
        flash_discount as "flashDiscount", 
        purchase_cost as "purchaseCost", 
        packing_cost as "packingCost", 
        profit, status, create_time as "createTime"
      FROM info_item 
      ${whereClause}
      ORDER BY create_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
    
    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取数据错误:', error);
    return NextResponse.json({ data: [], total: 0 }, { status: 200 });
  }
}
