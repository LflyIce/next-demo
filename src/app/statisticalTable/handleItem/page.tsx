"use client";
import { Form, Input, InputNumber, Button, Upload, message, Select, Flex } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import type { FormProps, UploadProps } from "antd";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductData {
    key: string;
    image: string;
    skc: string;
    model: string;
    link: string;
    price: number;
    minPrice: number;
    shipping: number;
    newDiscount: number;
    flashDiscount: number;
    purchaseCost: number;
    packingCost: number;
    profit: number;
    status: number
}

export default function HandleItem() {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>('');
    const router = useRouter();

    const uploadProps: UploadProps = {
        name: 'image',
        action: '/api/upload',
        maxCount: 1,
        onChange(info) {
            if (info.file.status === 'done') {
                setImageUrl(info.file.response.path);
                form.setFieldValue('image', info.file.response.path);
                message.success('图片上传成功');
            } else if (info.file.status === 'error') {
                message.error('图片上传失败');
            }
        },
    };

    const onFinish: FormProps<ProductData>['onFinish'] = async (values) => {
        const productData = {
            ...values,
            key: Date.now().toString(),
            image: imageUrl || '/images/sample.png',
            status: 1,
            // 自动计算折扣价
            newDiscount: values.price * 0.83,
            flashDiscount: values.price * 0.85,
            // 自动计算利润
            profit: values.minPrice - values.purchaseCost - values.packingCost - values.shipping,
        };

        try {
            const response = await fetch('/api/addProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            const result = await response.json();

            if (result.success) {
                message.success('添加成功');
                form.resetFields();
                setImageUrl('');
                router.push('/statisticalTable');
            } else {
                message.error('添加失败');
            }
        } catch (error) {
            message.error('提交失败');
        }
    };

    const onFinishFailed: FormProps<ProductData>['onFinishFailed'] = (errorInfo) => {
        message.error('请检查表单填写');
    };

    return (
        <div className="p-4 min-w-[800px] mx-auto">
            <h1 className="text-2xl mb-4">添加商品</h1>
            <Form
                form={form}
                name="productForm"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="商品图片"
                    name="image"
                >
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>上传图片</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="商品SKC"
                    name="skc"
                    rules={[{ required: true, message: '请输入商品SKC' }]}
                >
                    <Input placeholder="请输入SKC" />
                </Form.Item>

                <Form.Item
                    label="型号"
                    name="model"
                    rules={[{ required: true, message: '请输入型号' }]}
                >
                    <Input placeholder="请输入型号" />
                </Form.Item>

                <Form.Item
                    label="商品链接"
                    name="link"
                    rules={[{ required: true, message: '请输入商品链接' }]}
                >
                    <Input placeholder="请输入商品链接" />
                </Form.Item>


                <Flex justify="center">
                    <Form.Item
                        label="售价"
                        name="price"
                        rules={[{ required: true, message: '请输入售价' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '50%' }}
                            placeholder="请输入售价"
                            addonBefore="¥"
                        />
                    </Form.Item>
                    <span className="mx-2">-</span>
                    <Form.Item
                        label="运费"
                        name="shipping"
                        rules={[{ required: true, message: '请选择运费' }]}
                    >
                        <Select
                            placeholder="快递"
                            style={{ width: '100%' }}
                        >
                            <Select.Option value={32}>佐川500g</Select.Option>
                            <Select.Option value={19}>黑猫100g</Select.Option>
                        </Select>
                    </Form.Item>
                    <span className="mx-2">-</span>
                    <Form.Item
                        label="采购成本"
                        name="purchaseCost"
                        rules={[{ required: true, message: '请输入采购成本' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '60%' }}
                            placeholder="请输入采购成本"
                            addonBefore="¥"
                        />
                    </Form.Item>
                    <span className="mx-2">-</span>
                    <Form.Item
                        label="打包成本"
                        name="packingCost"
                        rules={[{ required: true, message: '请输入打包成本' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '60%' }}
                            placeholder="请输入打包成本"
                            addonBefore="¥"
                        />
                    </Form.Item>
                    <span className="mx-2">=</span>
                    <Form.Item label="利润" name="profit" rules={[{ required: true, message: '请输入利润' }]}>
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="请输入利润"
                            addonBefore="¥"
                        />
                    </Form.Item>
                </Flex>
                <Form.Item
                    label="最低售价"
                    name="minPrice"
                    rules={[{ required: true, message: '请输入最低售价' }]}
                >
                    <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="请输入最低售价"
                        addonBefore="¥"
                    />
                </Form.Item>


                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                        提交
                    </Button>
                    <Button onClick={() => router.back()}>
                        取消
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}