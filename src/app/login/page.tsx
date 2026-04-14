"use client";

import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // false=登录, true=注册
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success('登录成功');
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        router.push('/statisticalTable');
      } else {
        message.error(data.message || '登录失败');
      }
    } catch {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: { username: string; password: string; email: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success('注册成功，请登录');
        // 翻回登录页并填入用户名
        setIsFlipped(false);
      } else {
        message.error(data.message || '注册失败');
      }
    } catch {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const inputStyle: React.CSSProperties = {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    border: 'none',
    boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
    fontSize: 14,
  };

  const cardFaceStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    padding: '48px 40px',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px, rgba(0, 0, 0, 0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      perspective: '1200px',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          backgroundImage: 'radial-gradient(circle, #ebebeb 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease',
        }} />
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(0, 112, 243, 0.06) 0%, transparent 70%)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.5s ease 0.3s',
        }} />
      </div>

      {/* 翻转容器 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 380,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* 翻转内层 */}
        <div style={{
          position: 'relative',
          width: '100%',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          
          {/* ===== 正面：登录 ===== */}
          <div style={{
            ...cardFaceStyle,
            transform: 'rotateY(0deg)',
          }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                width: 40, height: 40, margin: '0 auto 20px', borderRadius: 8,
                backgroundColor: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#171717', margin: 0, letterSpacing: '-0.4px' }}>
                卖品统计
              </h1>
              <p style={{ fontSize: 14, color: '#666666', margin: '8px 0 0', fontWeight: 400 }}>
                登录以继续访问
              </p>
            </div>

            <Form name="login" onFinish={onLogin} autoComplete="off" layout="vertical" requiredMark={false}>
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]} style={{ marginBottom: 20 }}>
                <Input prefix={<UserOutlined style={{ color: '#808080' }} />} placeholder="用户名" style={inputStyle} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]} style={{ marginBottom: 28 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#808080' }} />} placeholder="密码" style={inputStyle} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading} block style={{
                  height: 44, borderRadius: 8, backgroundColor: '#171717', border: 'none',
                  fontWeight: 500, fontSize: 14, boxShadow: 'none',
                }}>
                  登录
                </Button>
              </Form.Item>
            </Form>

            {/* 切换注册 */}
            <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid #ebebeb' }}>
              <span style={{ fontSize: 13, color: '#808080' }}>还没有账号？</span>
              <button
                onClick={toggleFlip}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#0070f3', fontWeight: 500,
                  marginLeft: 4, padding: 0,
                }}
              >
                注册账号
              </button>
            </div>
          </div>

          {/* ===== 背面：注册 ===== */}
          <div style={{
            ...cardFaceStyle,
            transform: 'rotateY(180deg)',
          }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                width: 40, height: 40, margin: '0 auto 20px', borderRadius: 8,
                backgroundColor: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#171717', margin: 0, letterSpacing: '-0.4px' }}>
                创建账号
              </h1>
              <p style={{ fontSize: 14, color: '#666666', margin: '8px 0 0', fontWeight: 400 }}>
                注册后即可使用
              </p>
            </div>

            <Form name="register" onFinish={onRegister} autoComplete="off" layout="vertical" requiredMark={false}>
              <Form.Item name="username" rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]} style={{ marginBottom: 16 }}>
                <Input prefix={<UserOutlined style={{ color: '#808080' }} />} placeholder="用户名" style={inputStyle} />
              </Form.Item>
              <Form.Item name="email" rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入正确的邮箱地址' },
              ]} style={{ marginBottom: 16 }}>
                <Input prefix={<MailOutlined style={{ color: '#808080' }} />} placeholder="邮箱" style={inputStyle} />
              </Form.Item>
              <Form.Item name="password" rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]} style={{ marginBottom: 16 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#808080' }} />} placeholder="密码" style={inputStyle} />
              </Form.Item>
              <Form.Item name="confirmPassword" dependencies={['password']} rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次密码不一致'));
                  },
                }),
              ]} style={{ marginBottom: 28 }}>
                <Input.Password prefix={<LockOutlined style={{ color: '#808080' }} />} placeholder="确认密码" style={inputStyle} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading} block style={{
                  height: 44, borderRadius: 8, backgroundColor: '#0070f3', border: 'none',
                  fontWeight: 500, fontSize: 14, boxShadow: 'none',
                }}>
                  注册
                </Button>
              </Form.Item>
            </Form>

            {/* 切换登录 */}
            <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid #ebebeb' }}>
              <span style={{ fontSize: 13, color: '#808080' }}>已有账号？</span>
              <button
                onClick={toggleFlip}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#0070f3', fontWeight: 500,
                  marginLeft: 4, padding: 0,
                }}
              >
                返回登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
