import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 简单的 token 生成
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 简单的密码哈希 (SHA-256)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    // 查询用户
    const { rows } = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
    }

    const user = rows[0];
    const inputHash = hashPassword(password);

    if (user.password_hash !== inputHash) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
    }

    // 生成 token
    const token = generateToken();

    // 存储 token 到数据库（有效期24小时）
    await pool.query(
      'INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'24 hours\')',
      [user.id, token]
    );

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
}
