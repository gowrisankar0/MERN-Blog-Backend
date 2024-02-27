const mongoose =require("mongoose");
const dotenv =require("dotenv");
dotenv.config()



const connectDb = async()=>{
    try {
 
         const con =await mongoose.connect(process.env.MONGO_URI);
         console.log(`mongo db is connected ${con.connection.host}`);

        
    } catch (error) {

        console.log(error.message);
        
    }
}

module.exports= connectDb;