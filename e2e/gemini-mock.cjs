// Substitui somente o serviço externo; o navegador usa o backend real.
const http = require('node:http');
let mode = 'success';
let requests = [];
http.createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') return res.end('{}');
  if (req.url === '/control' && req.method === 'POST') {
    mode = JSON.parse(raw).mode;
    requests = [];
    return res.end(JSON.stringify({ mode }));
  }
  if (req.url === '/requests') return res.end(JSON.stringify(requests));
  if (req.method !== 'POST' || !req.url.endsWith(':generateContent')) {
    res.writeHead(404); return res.end('{}');
  }
  const body = JSON.parse(raw);
  requests.push(body);
  if (mode === 'disconnect') return req.socket.destroy();
  if (mode === 'rate-limit' || mode === 'unavailable') {
    res.writeHead(mode === 'rate-limit' ? 429 : 503);
    return res.end(JSON.stringify({ error: 'Provedor indisponível no teste' }));
  }
  if (mode === 'empty') return res.end(JSON.stringify({ candidates: [] }));
  if (mode === 'malformed') return res.end('invalid-json');
  const context = body.system_instruction.parts[0].text;
  const product = context.split('PRODUTOS:\n')[1]?.split('\n')[0];
  const title = product ? JSON.parse(product).title : 'o catálogo';
  res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: `Recomendo consultar ${title}. Posso ajudar com sua próxima leitura.` }] } }] }));
}).listen(8081, '0.0.0.0');
