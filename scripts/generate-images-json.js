const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../images');
const outputPath = path.join(__dirname, '../images.json');

const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

fs.readdir(imageDir, (err, files) => {
  if (err) {
    console.error('Failed to read images directory:', err.message);
    process.exit(1);
  }
  const images = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return allowedExts.includes(ext);
  }).sort();
  fs.writeFileSync(outputPath, JSON.stringify(images, null, 2), 'utf8');
  console.log(`Generated images.json with ${images.length} files`);
});
