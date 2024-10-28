import mongoose from "mongoose";
import { DATABASE_NAME } from "../constant.js";

const dbConnection = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DATABASE_NAME}`)
        console.log(`this is the conection instance host l ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("error", error);
        process.exit(1);
    }
}
export default dbConnection