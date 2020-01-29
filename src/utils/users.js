const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room}) => {
    // clean the data
    username = username.toLowerCase().trim();
    room = room.toLowerCase().trim();
    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }
    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })
    // validate username
    if (existingUser) {
        return {
            error: `User "${username}" already exists in room: "${room}"`
        }
    }
    // store user
    const user = {id, username, room};
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    })

    if (index !== -1) {
        return users.splice(index, 1)[0];   
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    })
    return user;
}

const getUsersInRoom = (room) => {
    room = room.toLowerCase().trim();
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    })

    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}