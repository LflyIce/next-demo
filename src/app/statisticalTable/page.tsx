"use client";
import { Table, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
}

export default function StatisticalTable() {
  const columns: ColumnsType<ProductData> = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (url: string) => <Image src={url} alt="商品" width={60} />,
    },
    {
      title: '商品SKC',
      dataIndex: 'skc',
      key: 'skc',
      width: 120,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '商品链接',
      dataIndex: 'link',
      key: 'link',
      width: 200,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          查看链接
        </a>
      ),
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '最低售价',
      dataIndex: 'minPrice',
      key: 'minPrice',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '运费',
      dataIndex: 'shipping',
      key: 'shipping',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '新品83折',
      dataIndex: 'newDiscount',
      key: 'newDiscount',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '秒杀85折',
      dataIndex: 'flashDiscount',
      key: 'flashDiscount',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '采购成本',
      dataIndex: 'purchaseCost',
      key: 'purchaseCost',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '打包成本',
      dataIndex: 'packingCost',
      key: 'packingCost',
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      width: 100,
      render: (value: number) => (
        <span style={{ color: value >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
          ¥{value.toFixed(2)}
        </span>
      ),
    },
  ];

  // 示例数据
  const data: ProductData[] = [
    {
      key: '1',
      image: '/images/sample.png',
      skc: 'SKC001',
      model: 'Model-A-001',
      link: 'https://example.com/product1',
      price: 299.00,
      minPrice: 259.00,
      shipping: 15.00,
      newDiscount: 248.17,
      flashDiscount: 254.15,
      purchaseCost: 180.00,
      packingCost: 20.00,
      profit: 59.00,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>卖品统计</h1>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: 1500 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}