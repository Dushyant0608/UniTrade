const app = require("./app");


const connectdb =  require("./src/config/db");
const { PORT } = require("./src/config/serverConfig");

connectdb().then(()=>{
    app.listen(PORT , ()=>{
        console.log("Server is running ",PORT);
    })
})


