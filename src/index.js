const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

const app = express()
const port = process.env.PORT || 3000

const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

let count = 0;
// socket.emit, socket.broadcast.emit, io.emit
// join
//              socket.broadcast.to.emit, io.to.emit
io.on('connection', (socket) => {
    console.log('New web socket connection!!');

    socket.on("join", (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options});
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Admin", `Welcome, ${user.username}`));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            return callback("User doesn't exists in this room");
        }
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback("Profanity is not allowed!");
        }
        io.to(user.room).emit("message", generateMessage(user.username, msg));
        callback()
    });

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            return callback("User doesn't exists in this room");
        }
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://maps.google.com?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            io.to(removedUser.room).emit("message", generateMessage("Admin",`"${removedUser.username}" has left`));
            io.to(removedUser.room).emit("roomData", {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server app on port ${port}`);
})