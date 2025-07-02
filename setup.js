// setup.js
const fs = require('fs');
const path = require('path');

// Define paths
const srcPath = path.join(__dirname, 'src');
const destPath = path.join(process.cwd(), 'src');

// Copy src folder to the destination
if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
}

fs.readdirSync(srcPath).forEach(file => {
    const srcFile = path.join(srcPath, file);
    const destFile = path.join(destPath, file);
    fs.copyFileSync(srcFile, destFile);
});

console.log('PagBank instalado com sucesso! Obtenha sua Connect Key em https://pbintegracoes.com/connect/autorizar.');