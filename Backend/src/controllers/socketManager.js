import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const ConnectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        
        console.log("User connected:", socket.id);

        const path = "/default"; // You forgot to define path!

        if (!connections[path]) connections[path] = [];
        connections[path].push(socket.id);

        timeOnline[socket.id] = new Date();

        // notify existing users
        for (let a = 0; a < connections[path].length; a++) {
            io.to(connections[path][a]).emit("user-joined", socket.id);
        }

        // send old messages
        if (messages[path]) {
            messages[path].forEach((msg) => {
                io.to(socket.id).emit(
                    "chat-message",
                    msg.data,
                    msg.sender,
                    msg["socket-id-sender"]
                );
            });
        }

        // ============ SIGNALING FOR WEBRTC ============
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // ============ CHAT MESSAGE ============
        socket.on("chat-message", (data, sender) => {
            let matchingRoom = "";

            for (const [roomKey, roomUsers] of Object.entries(connections)) {
                if (roomUsers.includes(socket.id)) {
                    matchingRoom = roomKey;
                    break;
                }
            }

            if (!messages[matchingRoom]) messages[matchingRoom] = [];

            messages[matchingRoom].push({
                sender,
                data,
                "socket-id-sender": socket.id
            });

            connections[matchingRoom].forEach((userId) => {
                io.to(userId).emit("chat-message", data, sender, socket.id);
            });
        });

        // ============ DISCONNECT ============
        socket.on("disconnect", () => {
            let keyFound = "";

            for (const [k, users] of Object.entries(connections)) {
                if (users.includes(socket.id)) {
                    keyFound = k;

                    users.forEach((userId) => {
                        io.to(userId).emit("user-left", socket.id);
                    });

                    // remove from list
                    connections[k] = users.filter((id) => id !== socket.id);

                    if (connections[k].length === 0) delete connections[k];

                    break;
                }
            }
        });

    }); // <-- this bracket was missing in your code!

    return io;
};
