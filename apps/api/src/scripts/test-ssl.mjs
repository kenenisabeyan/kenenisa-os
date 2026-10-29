import net from 'net';
import tls from 'tls';

const host = 'ep-floral-mud-b4mtf9wm.c-6.us-east-2.aws.neon.tech';
const port = 5432;

const socket = net.connect({ host, port }, () => {
  console.log('TCP Connected');
  // Send SSLRequest packet: length 8, code 80877103 (0x04D22E2F)
  const sslMsg = Buffer.from([0, 0, 0, 8, 4, 210, 46, 47]);
  socket.write(sslMsg);
});

socket.once('data', (data) => {
  const code = data.toString('utf8');
  console.log('SSLRequest response:', code);
  if (code === 'S') {
    const tlsSocket = tls.connect({
      socket: socket,
      servername: host,
    }, () => {
      console.log('TLS Handshake successful! Authorized:', tlsSocket.authorized);
      if (!tlsSocket.authorized) {
        console.log('Auth error:', tlsSocket.authorizationError);
      }
      tlsSocket.destroy();
    });
    tlsSocket.on('error', (err) => {
      console.error('TLS error:', err);
    });
  }
});

socket.on('error', (err) => console.error('Socket error:', err));
