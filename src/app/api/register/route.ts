import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100),
      password_hash VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  // 兼容旧表：如果没有 email 列就加上
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(100);
      END IF;
    END $$;
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
  
  // 插入默认用户
  const hash = crypto.createHash('sha256').update('admin123').digest('hex');
  await pool.query(`
    INSERT INTO users (username, password_hash) 
    VALUES ('admin', $1)
    ON CONFLICT (username) DO NOTHING
  `, [hash]);
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ success: false, message: '用户名至少3个字符' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: '密码至少6个字符' }, { status: 400 });
    }

    // 检查用户名是否已存在
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: '用户名已存在' }, { status: 409 });
    }

    // 创建用户
    const passwordHash = hashPassword(password);
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, passwordHash]
    );

    return NextResponse.json({
      success: true,
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({ success: false, message: '服务器错误', details: String(error) }, { status: 500 });
  }
}
