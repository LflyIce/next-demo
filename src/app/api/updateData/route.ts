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
        id, image, name, skc, model, link, price, min_price, 
        shipping, platform_subsidy, new_discount, flash_discount, 
        purchase_cost, packing_cost, profit, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT (id) DO UPDATE SET
        image = EXCLUDED.image,
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
        status = EXCLUDED.status
    `, [
      item.key, item.image || '', item.name, item.skc, item.model,
      item.link, item.price, item.minPrice, item.shipping,
      item.platformSubsidy, item.newDiscount, item.flashDiscount,
      item.purchaseCost, item.packingCost, item.profit, item.status
    ]);
    
    return NextResponse.json({ success: true, message: '数据更新成功' });
  } catch (error) {
    console.error('更新数据错误:', error);
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

// 查询所有数据
export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id as key, image, name, skc, model, link, price, 
        min_price as "minPrice", shipping, 
        platform_subsidy as "platformSubsidy", 
        new_discount as "newDiscount", 
        flash_discount as "flashDiscount", 
        purchase_cost as "purchaseCost", 
        packing_cost as "packingCost", 
        profit, status 
      FROM info_item 
      ORDER BY id
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取数据错误:', error);
    return NextResponse.json([], { status: 200 });
  }
}
