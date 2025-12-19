const sourcePort = Number(process.argv[2]);
const targetPort = Number(process.argv[3]);

const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

function handleProxyError(res) {
  if (!res || !res.writable) {
    return;
  }

  try {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Unable to connect to the target server');
    } else {
      res.end();
    }
  } catch (e) {
    console.error('Error handling proxy error response:', e);
  }
}

proxy.on('error', function (err, req, res) {
  console.error('Proxy error:', err);
  handleProxyError(res);
});

const server = http.createServer(function (req, res) {
  proxy.web(req, res, { target: `http://localhost:${sourcePort}` });
});

server.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head, { target: `ws://localhost:${sourcePort}` });
});

server.listen(targetPort, () => {
  console.log(`Starting proxy server: proxying ${targetPort} → ${sourcePort}`);
});
