const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

const formatMessage = require('./utils/formatMessage')
const { userJoin, getCurrentUser, leaveUser, joinRoom } = require('./utils/users')

const bot = 'Chat bot'
// public ishladi
app.use(express.static(path.join(__dirname, 'public')))


io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        // console.log(username, room);

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        const users = joinRoom(user.room)

        socket.emit('roomUsers', users)

        socket.emit('message', formatMessage(bot, 'Welcome to socket and hello from server...')) 
        socket.broadcast.to(user.room).emit('message', formatMessage(bot, `${user.username} joined the group`))  
    })

  

    // Odamdan ma'lumot olish
    socket.on('chat-message', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    
    socket.on('disconnect', () => {
        const user = leaveUser(socket.id)

       
        io.to(user.room).emit('message', formatMessage(bot, `${user.username} left the chat`))
    })

})

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port);

// Server ishladi
server.listen(port, () => {
    console.log('Server ishla...', port);
})

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}