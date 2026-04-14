import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 确保用户表存在
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_tokens_expires ON user_tokens(expires_at)`);
  
  // 插入默认用户 (admin / admin123)
  const hash = crypto.createHash('sha256').update('admin123').digest('hex');
  await pool.query(`
    INSERT INTO users (username, password_hash) 
    VALUES ('admin', $1)
    ON CONFLICT (username) DO NOTHING
  `, [hash]);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // 确保表存在
    await ensureTables();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

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

    const token = generateToken();

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
    return NextResponse.json({ success: false, message: '服务器错误', details: String(error) }, { status: 500 });
  }
}
