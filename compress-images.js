/**
 * 智能图片压缩工具
 * 将产品图片压缩到200KB以内，同时保证最佳质量
 * 
 * 特性：
 * - 自动备份原图
 * - 智能质量调整
 * - 保持图片宽高比
 * - 详细的压缩统计
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
    targetSize: 200 * 1024, // 200KB
    maxWidth: 1920, // 最大宽度
    maxHeight: 1920, // 最大高度
    initialQuality: 90, // 初始质量
    minQuality: 60, // 最低质量
    qualityStep: 5, // 质量递减步长
    backupSuffix: '.backup', // 备份后缀
};

// 图片目录
const IMAGES_DIR = path.join(__dirname, 'images', 'products');
const BACKUP_DIR = path.join(__dirname, 'images', 'products-backup');

// 统计数据
const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    originalSize: 0,
    compressedSize: 0,
};

/**
 * 获取文件大小（字节）
 */
function getFileSize(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch (error) {
        return 0;
    }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 创建备份目录
 */
function ensureBackupDir(originalPath) {
    const relativePath = path.relative(IMAGES_DIR, path.dirname(originalPath));
    const backupPath = path.join(BACKUP_DIR, relativePath);
    
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }
    
    return backupPath;
}

/**
 * 备份原始文件
 */
function backupFile(filePath) {
    try {
        const backupPath = ensureBackupDir(filePath);
        const fileName = path.basename(filePath);
        const backupFilePath = path.join(backupPath, fileName);
        
        // 如果备份已存在，跳过
        if (!fs.existsSync(backupFilePath)) {
            fs.copyFileSync(filePath, backupFilePath);
            console.log(`✓ 备份: ${path.relative(IMAGES_DIR, filePath)}`);
        }
        
        return true;
    } catch (error) {
        console.error(`✗ 备份失败: ${filePath}`, error.message);
        return false;
    }
}

/**
 * 智能压缩图片
 * 使用二分法逐步调整质量，确保文件大小在目标范围内
 */
async function compressImage(inputPath, outputPath) {
    const originalSize = getFileSize(inputPath);
    const ext = path.extname(inputPath).toLowerCase();
    
    // 如果已经小于目标大小，跳过
    if (originalSize <= CONFIG.targetSize) {
        console.log(`⊙ 跳过 (已达标): ${path.relative(IMAGES_DIR, inputPath)} - ${formatSize(originalSize)}`);
        stats.skipped++;
        return originalSize;
    }
    
    try {
        // 获取图片元数据
        const metadata = await sharp(inputPath).metadata();
        let { width, height } = metadata;
        
        // 如果图片太大，先按比例缩小
        if (width > CONFIG.maxWidth || height > CONFIG.maxHeight) {
            const ratio = Math.min(CONFIG.maxWidth / width, CONFIG.maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        let quality = CONFIG.initialQuality;
        let tempBuffer = null;
        let finalSize = 0;
        
        // 使用二分法查找最佳质量参数
        let minQ = CONFIG.minQuality;
        let maxQ = CONFIG.initialQuality;
        let bestBuffer = null;
        let bestQuality = minQ;
        
        while (maxQ - minQ > 2) {
            quality = Math.floor((minQ + maxQ) / 2);
            
            let sharpInstance = sharp(inputPath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            
            // 根据格式选择压缩方式
            if (ext === '.webp') {
                tempBuffer = await sharpInstance
                    .webp({ quality, effort: 6 })
                    .toBuffer();
            } else {
                tempBuffer = await sharpInstance
                    .jpeg({ 
                        quality, 
                        mozjpeg: true, // 使用 mozjpeg 获得更好的压缩
                        progressive: true // 渐进式JPEG
                    })
                    .toBuffer();
            }
            
            finalSize = tempBuffer.length;
            
            if (finalSize <= CONFIG.targetSize) {
                // 大小符合要求，尝试提高质量
                bestBuffer = tempBuffer;
                bestQuality = quality;
                minQ = quality;
            } else {
                // 文件太大，降低质量
                maxQ = quality;
            }
        }
        
        // 如果找到了合适的压缩结果
        if (bestBuffer && bestBuffer.length <= CONFIG.targetSize) {
            fs.writeFileSync(outputPath, bestBuffer);
            const compressedSize = bestBuffer.length;
            const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            
            console.log(`✓ 压缩成功: ${path.relative(IMAGES_DIR, inputPath)}`);
            console.log(`  ${formatSize(originalSize)} → ${formatSize(compressedSize)} (减少 ${reduction}%, 质量 ${bestQuality})`);
            
            stats.processed++;
            return compressedSize;
        } else {
            // 即使最低质量也无法达到目标，使用最低质量压缩
            console.log(`⚠ 警告: ${path.relative(IMAGES_DIR, inputPath)} 无法压缩到目标大小，使用最低质量`);
            
            let sharpInstance = sharp(inputPath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            
            if (ext === '.webp') {
                tempBuffer = await sharpInstance
                    .webp({ quality: CONFIG.minQuality, effort: 6 })
                    .toBuffer();
            } else {
                tempBuffer = await sharpInstance
                    .jpeg({ 
                        quality: CONFIG.minQuality, 
                        mozjpeg: true,
                        progressive: true 
                    })
                    .toBuffer();
            }
            
            fs.writeFileSync(outputPath, tempBuffer);
            stats.processed++;
            return tempBuffer.length;
        }
        
    } catch (error) {
        console.error(`✗ 压缩失败: ${path.relative(IMAGES_DIR, inputPath)}`, error.message);
        stats.failed++;
        return originalSize;
    }
}

/**
 * 递归处理目录中的所有图片
 */
async function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            await processDirectory(fullPath);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.webp'].includes(ext)) {
                stats.total++;
                const originalSize = getFileSize(fullPath);
                stats.originalSize += originalSize;
                
                // 备份原文件
                if (backupFile(fullPath)) {
                    // 压缩图片（直接覆盖原文件）
                    const compressedSize = await compressImage(fullPath, fullPath);
                    stats.compressedSize += compressedSize;
                }
                
                console.log(''); // 空行分隔
            }
        }
    }
}

/**
 * 打印统计报告
 */
function printReport() {
    const totalReduction = stats.originalSize > 0 
        ? ((1 - stats.compressedSize / stats.originalSize) * 100).toFixed(1)
        : 0;
    
    console.log('\n========================================');
    console.log('           压缩完成统计报告');
    console.log('========================================');
    console.log(`总图片数:     ${stats.total}`);
    console.log(`已处理:       ${stats.processed}`);
    console.log(`已跳过:       ${stats.skipped}`);
    console.log(`失败:         ${stats.failed}`);
    console.log(`----------------------------------------`);
    console.log(`原始总大小:   ${formatSize(stats.originalSize)}`);
    console.log(`压缩后大小:   ${formatSize(stats.compressedSize)}`);
    console.log(`节省空间:     ${formatSize(stats.originalSize - stats.compressedSize)}`);
    console.log(`压缩率:       ${totalReduction}%`);
    console.log(`----------------------------------------`);
    console.log(`备份位置:     ${path.relative(__dirname, BACKUP_DIR)}`);
    console.log('========================================\n');
}

/**
 * 主函数
 */
async function main() {
    console.log('\n🚀 开始智能图片压缩...\n');
    console.log(`目标大小: ${formatSize(CONFIG.targetSize)}`);
    console.log(`图片目录: ${path.relative(__dirname, IMAGES_DIR)}`);
    console.log(`备份目录: ${path.relative(__dirname, BACKUP_DIR)}\n`);
    
    // 确保备份目录存在
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // 检查图片目录是否存在
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ 错误: 图片目录不存在: ${IMAGES_DIR}`);
        return;
    }
    
    const startTime = Date.now();
    
    // 处理所有图片
    await processDirectory(IMAGES_DIR);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // 打印统计报告
    printReport();
    
    console.log(`⏱ 总耗时: ${duration} 秒\n`);
    
    if (stats.failed > 0) {
        console.log('⚠️  部分图片压缩失败，请检查错误信息\n');
    } else {
        console.log('✅ 所有图片处理完成！\n');
    }
}

// 运行主函数
main().catch(error => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
});
