/**
 * 图片大小检查工具
 * 检查所有产品图片的大小，找出超过200KB的图片
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images', 'products');
const TARGET_SIZE = 200 * 1024; // 200KB

const stats = {
    total: 0,
    oversize: 0,
    totalSize: 0,
    oversizeList: [],
};

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 递归检查目录
 */
function checkDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            checkDirectory(fullPath);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.webp', '.png'].includes(ext)) {
                stats.total++;
                const size = stat.size;
                stats.totalSize += size;
                
                if (size > TARGET_SIZE) {
                    stats.oversize++;
                    stats.oversizeList.push({
                        path: path.relative(IMAGES_DIR, fullPath),
                        size: size,
                        excess: size - TARGET_SIZE,
                    });
                }
            }
        }
    }
}

/**
 * 主函数
 */
function main() {
    console.log('\n📊 检查图片大小...\n');
    console.log(`目标大小: ${formatSize(TARGET_SIZE)}`);
    console.log(`图片目录: ${path.relative(__dirname, IMAGES_DIR)}\n`);
    
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ 错误: 图片目录不存在: ${IMAGES_DIR}`);
        return;
    }
    
    // 检查所有图片
    checkDirectory(IMAGES_DIR);
    
    // 按大小降序排列
    stats.oversizeList.sort((a, b) => b.size - a.size);
    
    console.log('========================================');
    console.log('           图片大小检查报告');
    console.log('========================================');
    console.log(`总图片数:     ${stats.total}`);
    console.log(`超标图片:     ${stats.oversize}`);
    console.log(`合格率:       ${((1 - stats.oversize / stats.total) * 100).toFixed(1)}%`);
    console.log(`总大小:       ${formatSize(stats.totalSize)}`);
    console.log(`平均大小:     ${formatSize(Math.round(stats.totalSize / stats.total))}`);
    console.log('========================================\n');
    
    if (stats.oversize > 0) {
        console.log('⚠️  超标图片列表 (前20个):\n');
        const displayList = stats.oversizeList.slice(0, 20);
        
        displayList.forEach((item, index) => {
            const excess = formatSize(item.excess);
            console.log(`${(index + 1).toString().padStart(2)}. ${item.path}`);
            console.log(`    大小: ${formatSize(item.size)} (超出 ${excess})\n`);
        });
        
        if (stats.oversizeList.length > 20) {
            console.log(`... 还有 ${stats.oversizeList.length - 20} 个超标图片\n`);
        }
        
        console.log('💡 提示: 运行 "npm run compress-images" 来压缩所有图片\n');
    } else {
        console.log('✅ 所有图片都符合大小要求！\n');
    }
}

main();

