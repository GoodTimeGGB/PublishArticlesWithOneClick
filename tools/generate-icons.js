const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('发', size / 2, size / 2 + size * 0.05);
  
  return canvas.toBuffer('image/png');
}

try {
  fs.writeFileSync('icons/icon16.png', createIcon(16));
  fs.writeFileSync('icons/icon48.png', createIcon(48));
  fs.writeFileSync('icons/icon128.png', createIcon(128));
  console.log('Icons created successfully!');
} catch (e) {
  console.log('To generate icons, run this HTML file in a browser: tools/generate-icons.html');
  console.log('Or manually create PNG icons in the icons/ folder.');
}
