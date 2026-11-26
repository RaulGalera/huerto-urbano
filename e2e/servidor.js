const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..', 'dist');
const puerto = Number(process.env.PUERTO) || 4173;
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf' };

http
  .createServer((req, res) => {
    const ruta = decodeURIComponent(req.url.split('?')[0]);
    let archivo = path.join(raiz, ruta);
    if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) archivo = path.join(raiz, 'index.html');
    res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream' });
    fs.createReadStream(archivo).pipe(res);
  })
  .listen(puerto);
