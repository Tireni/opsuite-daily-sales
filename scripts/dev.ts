import 'dotenv/config';
import { createServer } from 'vite';
import sales from '../api/sales.js';
import access from '../api/access.js';
const vite = await createServer({
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  plugins: [{ name: 'local-sales-api', configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0];
      if (path === '/api/sales') void sales(req, res);
      else if (path === '/api/access') void access(req, res);
      else next();
    });
  } }]
});
await vite.listen();
vite.printUrls();
