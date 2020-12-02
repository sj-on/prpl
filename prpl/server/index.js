const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');
const WebSocket = require('faye-websocket');
const chokidar = require('chokidar');
const open = require('open');
const { interpolate } = require('../src/actions/interpolate');

let ws;

// Serve the files on localhost
const server = http.createServer();

server.on('connection', () => {
  const index = fs.readFileSync(path.resolve('./dist/index.html')).toString();
  const socket = fs.readFileSync(path.resolve(__dirname, 'socket.js')).toString();

  if (index.includes('<script dev>')) {
    return;
  }

  const devIndex = index.replace(/<\/body>/, `<script dev>
      ${socket}
    </script>
  </body>`);

  fs.writeFileSync(path.resolve('./dist/index.html'), devIndex);
});

process.on('SIGINT', () => {
  const index = fs.readFileSync(path.resolve('./dist/index.html')).toString();
  const restoredIndex = index.replace(/<script dev>.*<\/body>/s, '</body>');
  fs.writeFileSync(path.resolve('./dist/index.html'), restoredIndex);
  process.exit(0);
});

server.on('request', (request, response) => {
  const config = {
    public: 'dist',
    cleanUrls: true,
    trailingSlash: false
  };
  return handler(request, response, config);
});

server.on('upgrade', (request, socket, head) => {
  ws = new WebSocket(request, socket, head);
});

server.listen(8000);

// Watch for file changes in the src directory
chokidar.watch(path.resolve('./src')).on('change', changedPath => {
  const { dir, base: name, ext: extension } = path.parse(changedPath);
  const relevantDir = dir.replace(path.resolve('.'), '');
  const relevantPath = `${relevantDir.replace('/src', '')}/${name}`;
  const item = {
    path: changedPath,
    name,
    extension,
    type: 'file'
  };
  Promise.resolve()
  .then(() => interpolate(item))
  .then(() => {
    ws.send('reload');
    console.log(`[Server] Updated ${relevantPath}`);
  });
});

open('http://localhost:8000');