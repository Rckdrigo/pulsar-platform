require('dotenv').config();
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = process.env.PORT || 8081;
const HOST = '0.0.0.0';

server.on('error', (err) => {
    console.error(`Server error:\n${err.stack}`);
    server.close();
});

const ARRAY_SIZE = 10;
const low = [];
let lowIdx = 0;
const high = [];
let highIdx = 0;

server.on('message', (msg, rinfo) => {
  const [message, value] = msg.toString().split(' ');
  if(message === 'low') {
    if (lowIdx % 20 === 0) {
      if (low.length >= ARRAY_SIZE) {
        low.shift();
      }
      low.push(parseFloat(value));
    }
    lowIdx++;
  }
  else if(message === 'high') {
    if (highIdx % 20 === 0) {
      if (high.length >= ARRAY_SIZE) {
        high.shift();
      }
      high.push(parseFloat(value));
    }
    highIdx++;
  }

  if((lowIdx + highIdx) % 10000 === 0) {
    console.log(low, high);
  }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(PORT, HOST);