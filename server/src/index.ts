import http from 'http';
import { createRestServer } from './restServer';
import { createWsServer } from './wsServer';

const PORT = parseInt(process.env.PORT || '4000', 10);

// Create Express app
const app = createRestServer();

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
createWsServer(server);

// Start listening
server.listen(PORT, () => {
  console.log(`\n🚀 PulseBoard Server running on port ${PORT}`);
  console.log(`   REST API:   http://localhost:${PORT}/api/health`);
  console.log(`   WebSocket:  ws://localhost:${PORT}`);
  console.log(`   Services:   http://localhost:${PORT}/api/services`);
  console.log(`   Alerts:     http://localhost:${PORT}/api/alerts\n`);
});
