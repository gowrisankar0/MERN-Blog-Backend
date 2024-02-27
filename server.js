const express =require("express");
const app =express();
const cors =require("cors");
const connectDb =require("./config/db");
const userRouter =require("./routes/userRoutes");
const postRouter =require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const uploade = require("express-fileupload")

require("dotenv").config()

app.get("/",(req,res)=>{
    res.send("API is working")
})

connectDb();
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
// app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(uploade());
app.use("/uploads",express.static(__dirname + "/uploads"))


app.use("/api/users",userRouter);
app.use("/api/posts",postRouter);
app.use(notFound)
app.use(errorHandler)


app.listen(process.env.PORT || 4000,()=>{
    console.log("server is up and running");
})