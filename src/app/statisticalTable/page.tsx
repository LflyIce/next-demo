"use client";
import { Table, Image, Tag, Input, InputNumber, Select, Form, Button, Space, Modal, message, Tooltip, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';

interface ProductData {
  key: string;
  image: string;
  name: string;
  skc: string;
  model: string;
  link: string;
  price: number;
  minPrice: number;
  shipping: number;
  platformSubsidy: number;
  newDiscount: number;
  flashDiscount: number;
  purchaseCost: number;
  packingCost: number;
  profit: number;
  status: number
}

const formatNum = (num: number | string, keepNum: number) => {
  return Number(Number(num).toFixed(keepNum));
}

export default function StatisticalTable() {
  const [data, setData] = useState<ProductData[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 从数据库加载数据
  useEffect(() => {
    setLoading(true);
    fetch('/api/updateData')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('加载数据失败:', err);
        message.error('加载数据失败');
        setLoading(false);
      });
  }, []);

  const isEditing = (record: ProductData) => record.key === editingKey;

  // 新增行
  const handleAdd = () => {
    const newKey = Date.now().toString();
    const newData: ProductData = {
      key: newKey,
      image: '',
      name: '',
      skc: '',
      model: '',
      link: '',
      price: 0,
      minPrice: 0,
      shipping: 19,
      platformSubsidy: 18.5,
      newDiscount: 0,
      flashDiscount: 0,
      purchaseCost: 0,
      packingCost: 3,
      profit: 0,
      status: 1,
    };
    setData([...data, newData]);
    edit(newData);
  };

  // 操作按钮切换
  const edit = (record: ProductData) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  // 计算利润或售价
  const calculateProfit = () => {
    const values = form.getFieldsValue(true);
    const price = Number(values.price) || 0;
    const shipping = Number(values.shipping) || 0;
    const purchaseCost = Number(values.purchaseCost) || 0;
    const packingCost = Number(values.packingCost) || 0;
    const platformSubsidy = Number(values.platformSubsidy) || 0;
    const profit = price - shipping - purchaseCost - packingCost + platformSubsidy;
    const newDiscount = formatNum(Number(profit * 0.83), 2);
    const flashDiscount = formatNum(Number(profit * 0.85), 2);
    // 最低售价 = 利润为0时的售价 + 3
    const minPrice = formatNum(Number(shipping + purchaseCost + packingCost - platformSubsidy + 3), 2);
    form.setFieldsValue({ profit, minPrice, newDiscount, flashDiscount });
  };

  const calculatePrice = () => {
    const values = form.getFieldsValue(true);
    const profit = Number(values.profit) || 0;
    const shipping = Number(values.shipping) || 0;
    const purchaseCost = Number(values.purchaseCost) || 0;
    const packingCost = Number(values.packingCost) || 0;
    const platformSubsidy = Number(values.platformSubsidy) || 0;
    const price = profit + shipping + purchaseCost + packingCost - platformSubsidy;
    const newDiscount = formatNum(Number(profit * 0.83), 2);
    const flashDiscount = formatNum(Number(profit * 0.85), 2);
    // 最低售价 = 利润为0时的售价 + 3
    const minPrice = formatNum(Number(shipping + purchaseCost + packingCost - platformSubsidy + 3), 2);
    console.log(price, minPrice, newDiscount, flashDiscount);
    form.setFieldsValue({ price, minPrice, newDiscount, flashDiscount });
  };

  // 监听表单字段变化
  const onValuesChange = (changedValues: any) => {
    // 如果修改的是利润，则计算售价
    if (changedValues.profit !== undefined) {
      calculatePrice();
    }
    // 如果修改的是其他费用，则计算利润
    else if (
      changedValues.price !== undefined ||
      changedValues.shipping !== undefined ||
      changedValues.purchaseCost !== undefined ||
      changedValues.packingCost !== undefined ||
      changedValues.platformSubsidy !== undefined
    ) {
      calculateProfit();
    }
  };

  // 取消编辑
  const cancel = () => {
    // 如果是新建的空行（所有必填字段为空），则删除该行
    if (editingKey) {
      const record = data.find(item => item.key === editingKey);
      if (record && !record.skc && !record.model && !record.price) {
        setData(data.filter(item => item.key !== editingKey));
      }
    }
    setEditingKey('');
  };

  const save = async (key: string) => {
    try {
      const row = await form.getFieldsValue(true);
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        // 确保数值字段为数字类型
        const price = Number(row.price) || 0;
        const shipping = Number(row.shipping) || 0;
        const purchaseCost = Number(row.purchaseCost) || 0;
        const packingCost = Number(row.packingCost) || 0;
        const platformSubsidy = Number(row.platformSubsidy) || 0;
        
        // 计算利润
        const profit = price - shipping - purchaseCost - packingCost + platformSubsidy;
        // 最低售价 = 利润为0时的售价 + 3
        const minPrice = shipping + purchaseCost + packingCost - platformSubsidy + 3;
        
        const updatedItem = {
          ...item,
          ...row,
          price,
          shipping,
          purchaseCost,
          packingCost,
          platformSubsidy,
          newDiscount: price * 0.83,
          flashDiscount: price * 0.85,
          profit,
          minPrice,
        };
        
        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey('');

        // 只传递当前编辑行数据
        const response = await fetch('/api/updateData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });
        
        const result = await response.json();
        if (!response.ok || result.error) {
          message.error(result.error || '保存失败');
          console.error('保存失败:', result);
        } else {
          message.success('保存成功');
        }
      }
    } catch (errInfo) {
      console.error('Validate Failed:', errInfo);
      message.error('保存失败');
    }
  };

  const handleStatusChange = async (key: string) => {
    const record = data.find(item => item.key === key);
    if (!record) return;
    
    const updatedItem = { ...record, status: record.status === 1 ? 0 : 1 };
    
    setData(data.map(item => item.key === key ? updatedItem : item));

    try {
      const response = await fetch('/api/updateData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      
      const result = await response.json();
      if (!response.ok || result.error) {
        message.error('状态更新失败');
        // 回滚状态
        setData(data.map(item => item.key === key ? record : item));
      }
    } catch (error) {
      console.error('更新失败:', error);
      message.error('状态更新失败');
      // 回滚状态
      setData(data.map(item => item.key === key ? record : item));
    }
  };

  // 删除行
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '是否确认删除该商品？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setData(data.filter(item => item.key !== key));

        try {
          await fetch('/api/updateData', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
          });
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<ProductData> = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      editable: true,
      render: (url: string) => {
        if (!url) return null;
        return (
          <Image 
            src={url} 
            alt="商品" 
            width={60}
            height={60}
            style={{ objectFit: 'cover' }}
            preview={{
              src: url,
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        );
      },
    },
    {
      title: '品名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      editable: true,
      render: (text: string) => <Tooltip title={text}>
        <span>{text.length > 20 ? text.substring(0, 10) + '...' : text}</span>
      </Tooltip>,
    },
    {
      title: '商品SKC',
      dataIndex: 'skc',
      key: 'skc',
      width: 120,
      editable: true,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 100,
      editable: true,
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      width: 100,
      editable: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          跳转
        </a>
      ),
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '最低售价',
      dataIndex: 'minPrice',
      key: 'minPrice',
      width: 120,
      disabled: true,
      editable: true, // 添加可编辑以支持表单字段
      render: (value: number) => <span style={{ color: 'red', fontWeight: 'bold' }}>
        ¥ {formatNum(Number(value), 2)}
      </span>
    },

    {
      title: '运费',
      dataIndex: 'shipping',
      key: 'shipping',
      width: 100,
      editable: true,
      render: (value: number) => <span>
        ¥ {formatNum(Number(value), 2)}
      </span>
    },

    {
      title: '采购成本',
      dataIndex: 'purchaseCost',
      key: 'purchaseCost',
      width: 120,
      editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '打包成本',
      dataIndex: 'packingCost',
      key: 'packingCost',
      width: 120,
      // editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '补贴',
      dataIndex: 'platformSubsidy',
      key: 'platformSubsidy',
      width: 100,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '83折',
      dataIndex: 'newDiscount',
      key: 'newDiscount',
      width: 100,
      disabled: true,
      editable: true, // 添加可编辑以支持表单字段
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '85折',
      dataIndex: 'flashDiscount',
      key: 'flashDiscount',
      width: 100,
      disabled: true,
      editable: true, // 添加可编辑以支持表单字段
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      width: 120,
      editable: true,
      sorter: {
        compare: (a: ProductData, b: ProductData) => a.profit - b.profit,
        multiple: 3,
      },
      render: (value: number) => (
        <span style={{ color: value >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
          ¥ {formatNum(Number(value), 2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: ProductData) => {
        return status === 1 ? (
          <Tag color="green" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(record.key)}>
            在售
          </Tag>
        ) : (
          <Tag color="red" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(record.key)}>
            下架
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ProductData) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button type="link" onClick={() => save(record.key)} size="small">
              保存
            </Button>
            <Button type="link" onClick={cancel} size="small">
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)} size="small">
              编辑
            </Button>
            <Button type="link" danger disabled={editingKey !== ''} onClick={() => handleDelete(record.key)} size="small">
              删除
            </Button>
          </Space>

        );
      },
    },
  ].map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ProductData) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell: React.FC<any> = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    let inputNode = <Input />;

    // 处理图片粘贴
    const handleImagePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const items = e.clipboardData.items;
      let hasImage = false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          hasImage = true;
          e.preventDefault();

          const file = item.getAsFile();
          if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              const result = await response.json();
              form.setFieldsValue({ image: result.path });
            } catch (error) {
              console.error('上传失败:', error);
            }
          }
          break;
        }
      }

      if (!hasImage) {
        e.preventDefault();
      }
    };

    if (dataIndex === 'image') {
      inputNode = <Input placeholder="粘贴图片" onPaste={handleImagePaste} />;
    } else if (dataIndex === 'minPrice' || dataIndex === 'newDiscount' || dataIndex === 'flashDiscount') {
      // 只读字段，禁止编辑
      inputNode = <InputNumber min={0} precision={2} style={{ width: '100%' }} disabled />;
    } else if (dataIndex === 'price' || dataIndex === 'packingCost' || dataIndex === 'platformSubsidy' || dataIndex === 'profit') {
      inputNode = <InputNumber min={0} precision={2} style={{ width: '100%' }} />;
    } else if (dataIndex === 'shipping') {
      inputNode = (
        <Select style={{ width: '100%' }} defaultValue={19}>
          <Select.Option value={19}>19</Select.Option>
          <Select.Option value={32}>32</Select.Option>
        </Select>
      );
    }

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `请输入${title}`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // 从 JSON 文件读取数据

  return (
    <Spin spinning={loading} tip="加载中...">
      <div className='p-4'>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className='text-2xl font-bold text-black'>卖品统计</h1>
          <Button type="primary" onClick={handleAdd}>
            新增商品
          </Button>
        </div>
        <Form form={form} component={false} onValuesChange={onValuesChange}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={columns}
            dataSource={data}
            scroll={{ x: 1500 }}
            pagination={{ pageSize: 10 }}
          />
        </Form>
      </div>
    </Spin>
  );
}