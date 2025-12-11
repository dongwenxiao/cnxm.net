/**
 * 图片恢复工具
 * 从备份目录恢复原始图片
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images', 'products');
const BACKUP_DIR = path.join(__dirname, 'images', 'products-backup');

let restored = 0;
let failed = 0;

/**
 * 递归恢复目录
 */
function restoreDirectory(backupPath, targetPath) {
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ 备份目录不存在: ${backupPath}`);
        return;
    }
    
    const items = fs.readdirSync(backupPath);
    
    for (const item of items) {
        const backupItemPath = path.join(backupPath, item);
        const targetItemPath = path.join(targetPath, item);
        const stat = fs.statSync(backupItemPath);
        
        if (stat.isDirectory()) {
            if (!fs.existsSync(targetItemPath)) {
                fs.mkdirSync(targetItemPath, { recursive: true });
            }
            restoreDirectory(backupItemPath, targetItemPath);
        } else if (stat.isFile()) {
            try {
                fs.copyFileSync(backupItemPath, targetItemPath);
                console.log(`✓ 恢复: ${path.relative(BACKUP_DIR, backupItemPath)}`);
                restored++;
            } catch (error) {
                console.error(`✗ 恢复失败: ${backupItemPath}`, error.message);
                failed++;
            }
        }
    }
}

/**
 * 主函数
 */
function main() {
    console.log('\n🔄 开始恢复原始图片...\n');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error('❌ 错误: 备份目录不存在！');
        console.log(`   请确保备份目录存在: ${BACKUP_DIR}\n`);
        return;
    }
    
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    
    const startTime = Date.now();
    
    // 恢复所有文件
    restoreDirectory(BACKUP_DIR, IMAGES_DIR);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n========================================');
    console.log('           恢复完成统计');
    console.log('========================================');
    console.log(`成功恢复:     ${restored} 个文件`);
    console.log(`失败:         ${failed} 个文件`);
    console.log(`耗时:         ${duration} 秒`);
    console.log('========================================\n');
    
    if (failed > 0) {
        console.log('⚠️  部分文件恢复失败，请检查错误信息\n');
    } else {
        console.log('✅ 所有图片恢复完成！\n');
    }
}

main();

