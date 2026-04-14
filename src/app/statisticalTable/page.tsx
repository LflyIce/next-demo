"use client";
import { Table, Image, Tag, Input, InputNumber, Select, Form, Button, Space, Modal, message, Tooltip, Spin, Dropdown } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import datas from './data.json';

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
  status: number;
  createTime: string;
  classId?: number;
  companyId?: number;
}

interface ItemClass {
  classId: number;
  className: string;
}

const formatNum = (num: number | string | null | undefined, keepNum: number) => {
  if (num === null || num === undefined || num === '' || isNaN(Number(num))) {
    return 0;
  }
  return Number(Number(num).toFixed(keepNum));
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StatisticalTable() {
  const [data, setData] = useState<ProductData[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<number | undefined>(undefined);
  const [searchClassId, setSearchClassId] = useState<number | undefined>(undefined);
  const [timeRange, setTimeRange] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [itemClasses, setItemClasses] = useState<ItemClass[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // 加载商品类别
  const fetchItemClasses = async () => {
    try {
      const res = await fetch('/api/itemClass');
      const result = await res.json();
      setItemClasses(result.data || []);
    } catch (err) {
      console.error('加载商品类别失败:', err);
    }
  };

  // 加载数据
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (searchName) params.append('name', searchName);
      if (searchStatus !== undefined) params.append('status', searchStatus.toString());
      if (searchClassId !== undefined) params.append('classId', searchClassId.toString());
      if (timeRange) params.append('timeRange', timeRange);
      
      const res = await fetch(`/api/updateData?${params}`);
      const result = await res.json();
      
      setData(result.data || []);
      setTotal(result.total || 0);
      setCurrentPage(page);
      setCurrentPageSize(pageSize);
      // 保存当前用户 id
      if (result.userId) {
        setCurrentUserId(result.userId);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchItemClasses();
    fetchData(1, currentPageSize);
  }, []);

  // 筛选条件变化时重新查询
  useEffect(() => {
    if (currentPage === 1) {
      fetchData(1, currentPageSize);
    } else {
      setCurrentPage(1);
      fetchData(1, currentPageSize);
    }
  }, [searchName, searchStatus, searchClassId, timeRange]);

  // 重置筛选
  const handleReset = () => {
    setSearchName('');
    setSearchStatus(undefined);
    setSearchClassId(undefined);
    setTimeRange(undefined);
    setCurrentPage(1);
  };

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
      shipping: 17,
      platformSubsidy: 18.5,
      newDiscount: 0,
      flashDiscount: 0,
      purchaseCost: 0,
      packingCost: 3,
      profit: 0,
      status: 1,
      createTime: formatDate(new Date()),
      classId: undefined,
    };
    setData([newData, ...data]);
    edit(newData);
  };

  // 导出功能
  const handleExport = (type: 'xlsx' | 'csv') => {
    const exportData = selectedRowKeys.length > 0
      ? data.filter(item => selectedRowKeys.includes(item.key))
      : data;

    if (exportData.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }

    const headers = ['品名', '图片', '链接', 'SKC', '型号', '申报价', '最低售价', '运费', '采购成本', '打包费', '补贴', '83折', '85折', '利润', '状态', '创建时间', '类别'];
    const className = (classId: number | undefined) => itemClasses.find(c => c.classId === classId)?.className || '-';

    const rows = exportData.map(item => [
      item.name || '',
      item.image || '',
      item.link || '',
      item.skc || '',
      item.model || '',
      item.price ?? '',
      item.minPrice ?? '',
      item.shipping ?? '',
      item.purchaseCost ?? '',
      item.packingCost ?? '',
      item.platformSubsidy ?? '',
      item.newDiscount ?? '',
      item.flashDiscount ?? '',
      item.profit ?? '',
      item.status === 1 ? '在售' : '下架',
      item.createTime ? formatDate(item.createTime) : '',
      className(item.classId),
    ]);

    if (type === 'csv') {
      // CSV 导出
      const bom = '\uFEFF'; // UTF-8 BOM 确保中文不乱码
      const csvContent = bom + [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `商品数据_${formatDate(new Date())}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      message.success(`已导出 ${exportData.length} 条数据`);
    } else {
      // XLSX 导出（用 HTML 表格方式，Excel 可直接打开）
      let tableHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>商品数据</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>';
      tableHtml += '<tr>' + headers.map(h => `<th style="background:#f0f0f0;font-weight:bold">${h}</th>`).join('') + '</tr>';
      rows.forEach(row => {
        tableHtml += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
      });
      tableHtml += '</table></body></html>';
      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `商品数据_${formatDate(new Date())}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      message.success(`已导出 ${exportData.length} 条数据`);
    }
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
          createTime: item.createTime || formatDate(new Date()),
          classId: row.classId || undefined,
          companyId: item.companyId || currentUserId || undefined,
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
          // 保存成功后重新加载当前页
          fetchData(currentPage, currentPageSize);
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
      resizable: true,
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
      width: 150,
      resizable: true,
      editable: true,
      render: (text: string) => <Tooltip title={text}>
        <span>{text.length > 20 ? text.substring(0, 10) + '...' : text}</span>
      </Tooltip>,
    },
    {
      title: '商品类别',
      dataIndex: 'classId',
      key: 'classId',
      width: 120,
      resizable: true,
      editable: true,
      render: (classId: number) => {
        const className = itemClasses.find(c => c.classId === classId)?.className || '-';
        return <span>{className}</span>;
      },
    },
    {
      title: '商品SKC',
      dataIndex: 'skc',
      key: 'skc',
      width: 120,
      resizable: true,
      editable: true,
      hidden: true,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 100,
      resizable: true,
      editable: true,
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      width: 80,
      resizable: true,
      editable: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          跳转
        </a>
      ),
    },
    {
      title: '申报价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      resizable: true,
      editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '最低售价',
      dataIndex: 'minPrice',
      key: 'minPrice',
      width: 100,
      resizable: true,
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
      width: 80,
      resizable: true,
      editable: true,
      render: (value: number) => <span>
        ¥ {formatNum(Number(value), 2)}
      </span>
    },

    {
      title: '采购成本',
      dataIndex: 'purchaseCost',
      key: 'purchaseCost',
      width: 100,
      resizable: true,
      editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '打包费',
      dataIndex: 'packingCost',
      key: 'packingCost',
      width: 100,
      resizable: true,
      // editable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '补贴',
      dataIndex: 'platformSubsidy',
      key: 'platformSubsidy',
      width: 80,
      resizable: true,
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '83折',
      dataIndex: 'newDiscount',
      key: 'newDiscount',
      width: 80,
      resizable: true,
      disabled: true,
      editable: true, // 添加可编辑以支持表单字段
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    {
      title: '85折',
      dataIndex: 'flashDiscount',
      key: 'flashDiscount',
      width: 80,
      resizable: true,
      disabled: true,
      editable: true, // 添加可编辑以支持表单字段
      render: (value: number) => `¥${formatNum(Number(value), 2)}`,
    },
    
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      width: 100,
      resizable: true,
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
      width: 80,
      resizable: true,
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
    ,
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 80,
      resizable: true,
      render: (createTime: string, record: ProductData) => {
        // 将 ISO 格式时间转换为 yyyy-mm-dd 格式
        const formattedDate = createTime ? formatDate(createTime) : '';
        return <span>{formattedDate}</span>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      resizable: true,
      fixed: 'right',
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
    } else if (dataIndex === 'classId') {
      inputNode = (
        <Select style={{ width: '100%' }} placeholder="请选择类别" allowClear>
          {itemClasses.map(cls => (
            <Select.Option key={cls.classId} value={cls.classId}>
              {cls.className}
            </Select.Option>
          ))}
        </Select>
      );
    } else if (dataIndex === 'minPrice' || dataIndex === 'newDiscount' || dataIndex === 'flashDiscount') {
      // 只读字段，禁止编辑
      inputNode = <InputNumber min={0} precision={2} style={{ width: '100%' }} disabled />;
    } else if (dataIndex === 'price' || dataIndex === 'packingCost' || dataIndex === 'platformSubsidy' || dataIndex === 'profit') {
      inputNode = <InputNumber min={0} precision={2} style={{ width: '100%' }} />;
    } else if (dataIndex === 'shipping') {
      inputNode = (
        <Select style={{ width: '100%' }} defaultValue={19}>
          <Select.Option value={19}>19</Select.Option>
          <Select.Option value={33}>33</Select.Option>
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
        <h1 className='text-2xl font-bold text-black' style={{ marginBottom: 16 }}>卖品统计</h1>
        
        {/* 搜索筛选区域 */}
        <div style={{ 
          marginBottom: 16, 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
            <Input
              placeholder="搜索商品名称"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="选择状态"
              value={searchStatus}
              onChange={setSearchStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value={1}>在售</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
            <Select
              placeholder="选择类别"
              value={searchClassId}
              onChange={setSearchClassId}
              style={{ width: 120 }}
              allowClear
            >
              {itemClasses.map(cls => (
                <Select.Option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="选择时间"
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="today">今天</Select.Option>
              <Select.Option value="yesterday">昨天</Select.Option>
              <Select.Option value="last3days">近三天</Select.Option>
            </Select>
            <Button onClick={handleReset}>重置</Button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {selectedRowKeys.length > 0 && (
              <span style={{ fontSize: 13, color: '#666' }}>已选 {selectedRowKeys.length} 项</span>
            )}
            <Dropdown menu={{
              items: [
                { key: 'xlsx', label: '导出 Excel (.xls)' },
                { key: 'csv', label: '导出 CSV' },
              ],
              onClick: ({ key }) => handleExport(key as 'xlsx' | 'csv'),
            }}>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </Dropdown>
            <Button type="primary" onClick={handleAdd}>
              新增商品
            </Button>
          </div>
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
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            scroll={{ x: 1500 }}
            pagination={{
              current: currentPage,
              pageSize: currentPageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, pageSize) => {
                fetchData(page, pageSize);
              },
            }}
            bordered
            tableLayout="auto"
          />
        </Form>
      </div>
    </Spin>
  );
}