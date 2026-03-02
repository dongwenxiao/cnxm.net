# 线束产品更新日志

## 更新时间
2026年3月2日

## 更新内容

### 1. 新增8个线束产品
在 Wire Harnesses（线束）类别下新增了8个产品，排在原有产品之前：

1. **电动工具专用线束** (EY.028.0007)
   - 产品图：1张
   - 工程图：1张 (PNG格式)

2. **XH连接器线束**
   - 产品图：1张
   - 工程图：无

3. **SH1.0-8P无刷电动工具开关线束**
   - 产品图：1张
   - 工程图：2张 (PDF + DWG格式)

4. **51006连接器线束（5P）**
   - 产品图：1张
   - 工程图：2张 (PDF格式)

5. **无刷电动工具开关线束**
   - 产品图：1张
   - 工程图：1张 (PDF格式)

6. **VH/SM/XH多连接器线束**
   - 产品图：1张
   - 工程图：2张 (PDF格式)

7. **51005/JC15连接器线束**
   - 产品图：1张
   - 工程图：1张 (PDF格式)

8. **GH端子DC连接器线束**
   - 产品图：1张
   - 工程图：1张 (PDF格式)

### 2. 产品图片优化
- 所有产品图片已从30-40MB压缩到30-40KB
- 使用 `sips` 工具将图片统一调整为800px宽度
- 大幅提升网页加载速度

### 3. 工程图功能增强
- 新增工程图展示功能，支持多张工程图切换
- 支持格式：PDF、PNG、JPG
- 点击产品后弹窗显示：
  1. 工程图区域（如有）- 显示在顶部
  2. 产品大图 - 显示在中间
  3. 产品信息和下载按钮 - 显示在底部

### 4. 工程图查看器特性
- **缩略图切换**：点击不同的工程图标签即可切换查看
- **格式图标**：PDF文件显示文件图标，图片显示图片图标
- **PDF预览**：使用浏览器内置的 `<embed>` 标签直接预览PDF
- **图片预览**：PNG/JPG格式的工程图以图片形式展示
- **不支持格式**：DWG等格式提供下载链接

### 5. 多语言支持
所有新产品名称已添加完整的多语言翻译：
- 英语 (English)
- 中文 (简体中文)
- 日语 (日本語)
- 俄语 (Русский)
- 葡萄牙语 (Português)

新增翻译键：
- `product_engineering_drawings` - "工程图纸"
- `product_drawing_format_unsupported` - "此文件格式无法在浏览器中预览"

### 6. 文件结构

```
images/wire-harness/
├── product-1-compressed.jpg        # 产品1主图
├── product-1-drawing-1.png         # 产品1工程图
├── product-2-compressed.jpg        # 产品2主图
├── product-3-compressed.jpg        # 产品3主图
├── product-3-drawing-1.pdf         # 产品3工程图1
├── product-3-drawing-2.dwg         # 产品3工程图2
├── product-6-compressed.jpg        # 产品6主图
├── product-6-drawing-1.pdf         # 产品6工程图1
├── product-6-drawing-2.pdf         # 产品6工程图2
├── product-8-compressed.jpg        # 产品8主图
├── product-8-drawing-1.pdf         # 产品8工程图
├── product-11-compressed.jpg       # 产品11主图
├── product-11-drawing-1.pdf        # 产品11工程图1
├── product-11-drawing-2.pdf        # 产品11工程图2
├── product-13-compressed.jpg       # 产品13主图
├── product-13-drawing-1.pdf        # 产品13工程图
├── product-20-compressed.jpg       # 产品20主图
└── product-20-drawing-1.pdf        # 产品20工程图
```

### 7. 代码更新

#### products.json
- 在 `wire-harnesses` 类别中新增8个产品对象
- 每个产品支持 `drawings` 数组存储工程图信息
- 工程图对象包含：`type`（格式）、`file`（路径）、`name`（名称）

#### products.js
- 更新 `openProductModal()` 函数支持工程图展示
- 新增工程图缩略图和查看器HTML生成逻辑
- 新增工程图切换交互功能

#### products.css
- 新增 `.modal-drawings-section` 样式
- 新增 `.drawings-thumbnails` 和 `.drawing-thumb` 样式
- 新增 `.drawings-viewer` 和 `.drawing-item` 样式
- 新增响应式布局支持

#### i18n.js
- 添加工程图相关翻译键

#### products.html
- 更新所有资源版本号从 `?v=6` 到 `?v=7` 以清除浏览器缓存

## 测试说明

访问 http://localhost:8080/products.html

1. 切换到 "Wire Harnesses" 标签
2. 查看最前面的8个新产品
3. 点击任一产品，查看弹窗
4. 如果有工程图，尝试切换不同的工程图标签
5. 测试多语言切换功能

## 注意事项

- 所有产品图片已优化，加载速度快
- PDF文件可以直接在浏览器中预览
- DWG文件无法预览，但提供下载功能
- 确保浏览器支持PDF预览（现代浏览器均支持）
- 建议使用 Chrome、Firefox、Safari 或 Edge 浏览器

## 保持不变的内容

✓ 原有的8个Wire Harnesses产品保持不变，位置调整到新产品之后
✓ 其他产品类别完全不受影响
✓ 网站整体布局、样式和功能保持一致
✓ 多语言功能正常工作
✓ 所有页面的导航和链接正常
