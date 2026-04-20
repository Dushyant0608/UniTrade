const app = require("./app");
const http = require("http");
const {Server} = require("socket.io");

const connectdb =  require("./src/config/db");
const { PORT } = require("./src/config/serverConfig");

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : ["http://localhost:5173", "http://localhost:5174"],
        credentials : true
    }
});

io.on("connection" , (socket)=>{
    console.log("User connected: ",socket.id);

    socket.on('join_room', (roomId)=>{
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message',(data)=>{
        socket.to(data.roomId).emit("receive_message",data);
    });

    socket.on('typing',(data)=>{
        socket.to(data.roomId).emit("user_typing", data);
    });

    socket.on("stop_typing", (data)=>{
        socket.to(data.roomId).emit("user_stop_typing", data);
    })

    socket.on("disconnect", ()=>{
        console.log("User dsiconnected: ",socket.id);
    })
});



connectdb().then(()=>{
    server.listen(PORT , ()=>{
        console.log("Server is running ",PORT);
    })
})


