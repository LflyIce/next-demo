import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

export async function GET(request: NextRequest) {
  try {
    await ensureTables();
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { rows } = await pool.query(
      'SELECT u.id, u.username FROM user_tokens t JOIN users u ON t.user_id = u.id WHERE t.token = $1 AND t.expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username: rows[0].username,
    });
  } catch (error) {
    console.error('验证错误:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      await pool.query('DELETE FROM user_tokens WHERE token = $1', [token]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
