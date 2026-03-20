/**
 * 压缩8张新的线束图片
 * 将 Wire Harnesses/9.jpg ~ 16.jpg 压缩并转换为 webp 格式
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGET_SIZE = 150 * 1024; // 150KB
const MAX_DIM = 1200;
const DIR = path.join(__dirname, 'images', 'products', 'Wire Harnesses');

const files = ['9.jpg','10.jpg','11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg'];

function fmt(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
    return (b/1024/1024).toFixed(1) + ' MB';
}

async function compressOne(jpgFile) {
    const inputPath = path.join(DIR, jpgFile);
    const webpFile = jpgFile.replace('.jpg', '.webp');
    const outputPath = path.join(DIR, webpFile);

    const origSize = fs.statSync(inputPath).size;

    // 获取尺寸
    const meta = await sharp(inputPath).metadata();
    let w = meta.width, h = meta.height;
    if (w > MAX_DIM || h > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
    }

    // 二分法查找最佳quality
    let lo = 55, hi = 85, bestBuf = null, bestQ = lo;
    while (hi - lo > 2) {
        const q = Math.floor((lo + hi) / 2);
        const buf = await sharp(inputPath)
            .resize(w, h, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: q, effort: 6 })
            .toBuffer();
        if (buf.length <= TARGET_SIZE) {
            bestBuf = buf; bestQ = q; lo = q;
        } else {
            hi = q;
        }
    }

    // 如果没找到（即使最低质量也超目标），用最低质量
    if (!bestBuf) {
        bestBuf = await sharp(inputPath)
            .resize(w, h, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: lo, effort: 6 })
            .toBuffer();
        bestQ = lo;
    }

    fs.writeFileSync(outputPath, bestBuf);
    // 删除原始JPG
    fs.unlinkSync(inputPath);

    const reduction = ((1 - bestBuf.length / origSize) * 100).toFixed(1);
    console.log(`✓ ${jpgFile} → ${webpFile}  ${fmt(origSize)} → ${fmt(bestBuf.length)}  (-${reduction}%, q=${bestQ})`);
    return { orig: origSize, compressed: bestBuf.length, webpFile };
}

async function main() {
    console.log('\n🚀 开始压缩8张新线束图片...\n');
    let totalOrig = 0, totalComp = 0;
    for (const f of files) {
        const r = await compressOne(f);
        totalOrig += r.orig;
        totalComp += r.compressed;
    }
    console.log(`\n✅ 全部完成！`);
    console.log(`总原始大小: ${fmt(totalOrig)}`);
    console.log(`总压缩后:   ${fmt(totalComp)}`);
    console.log(`总压缩率:   ${((1 - totalComp/totalOrig)*100).toFixed(1)}%\n`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
