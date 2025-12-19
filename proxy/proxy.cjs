const sourcePort = Number(process.argv[2]);
const targetPort = Number(process.argv[3]);

const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

proxy.on('error', function (err, req, res) {
  console.error('Proxy error:', err);
  
  // Check if response is writable before attempting to send error
  if (res && !res.headersSent && res.writable) {
    try {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Unable to connect to the target server');
    } catch (e) {
      console.error('Error sending 502 response:', e);
    }
  } else if (res && res.writable) {
    // If headers were already sent but response is still writable, try to end it
    try {
      res.end();
    } catch (e) {
      console.error('Error ending response:', e);
    }
  }
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
