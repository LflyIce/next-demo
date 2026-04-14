"use client";

import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: { username: string; password: string }) => {
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {/* 网格点阵背景 */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          backgroundImage: 'radial-gradient(circle, #ebebeb 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease',
        }} />
        {/* 顶部光晕 */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(0, 112, 243, 0.06) 0%, transparent 70%)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.5s ease 0.3s',
        }} />
      </div>

      {/* 主卡片 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 380,
        padding: '48px 40px',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px, rgba(0, 0, 0, 0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Logo / 标题 */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
        }}>
          <div style={{
            width: 40,
            height: 40,
            margin: '0 auto 20px',
            borderRadius: 8,
            backgroundColor: '#171717',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#171717',
            margin: 0,
            letterSpacing: '-0.4px',
          }}>
            卖品统计
          </h1>
          <p style={{
            fontSize: 14,
            color: '#666666',
            margin: '8px 0 0',
            fontWeight: 400,
          }}>
            登录以继续访问
          </p>
        </div>

        {/* 表单 */}
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#808080' }} />}
              placeholder="用户名"
              style={{
                height: 44,
                borderRadius: 8,
                backgroundColor: '#fafafa',
                border: 'none',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                fontSize: 14,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#808080' }} />}
              placeholder="密码"
              style={{
                height: 44,
                borderRadius: 8,
                backgroundColor: '#fafafa',
                border: 'none',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                fontSize: 14,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                backgroundColor: '#171717',
                border: 'none',
                fontWeight: 500,
                fontSize: 14,
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#171717';
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 底部提示 */}
        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#808080',
          margin: '24px 0 0',
        }}>
          默认账号: admin / admin123
        </p>
      </div>
    </div>
  );
}
