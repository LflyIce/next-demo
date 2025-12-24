"use client";
import TextArea from "antd/es/input/TextArea";
import { useRef, useEffect } from "react";

export default function ToolsPage() {

  const imageText = useRef<HTMLTextAreaElement>(null);

  /**
   * 处理粘贴事件，仅允许粘贴图片
   * @param e - 粘贴事件对象
   */
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let hasImage = false;

    // 遍历粘贴板项，查找图片
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        hasImage = true;
        e.preventDefault(); // 阻止默认粘贴行为

        const file = item.getAsFile();
        if (file) {
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            // 上传图片到服务器
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            const result = await response.json();
            console.log('上传成功:', result);
          } catch (error) {
            console.error('上传失败:', error);
          }
        }
        break; // 找到图片后退出循环
      }
    }

    // 如果没有图片，阻止粘贴
    if (!hasImage) {
      e.preventDefault();
    }
  };

  return(
    <div>
        <TextArea rows={4} className="image-text-area" ref={imageText} onPaste={handlePaste}/>
    </div>
  )
}
