const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('send_message', (data) => {
        const { encryptedMessage, sender, receiver, iv } = data;
        io.emit('receive_message', { encryptedMessage, sender, receiver, iv });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
