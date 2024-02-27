const mongoose = require("mongoose");
const { schema } = require("./userModel");


const PostSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        enum:["Agriculture","Business","Education","Entertainment","Art","Investment","Uncategorized","Weather"],
        message:"{VALUE is not supported}",
    },
    discription:{
        type:String,
        required:true
        
    },
    
    creater:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    thumbnail:{
        type:String,
        required:true
    }

},{timestamps:true});


const Post = mongoose.model("posts",PostSchema);

module.exports = Post;