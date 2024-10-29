// remember to config the env packages to firstly distribute the env variable to all over the application
import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
import mongoose from "mongoose";
import { DATABASE_NAME } from "./constant.js";
import dbConnection from "./db/index.js";
import { app } from "./app.js";


dbConnection()
.then(
  ()=> {
    app.get("/", (req,res )=>{
      res.send("hi you are on right port")
    })
    app.listen(process.env.PORT, ()=>{
      console.log("app is listening at port ", process.env.PORT)
    });
    app.on("error",(error)=>{
      console.log("the errror is ", error);
    })
  }
)
.catch(error=>console.log("error while connecting to database", error))





// this is the effi way to connect to the database but this is not a professional approch so dont prefer it most of the times
/*
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${DATABASE_URI}/${DATABASE_NAME}`);
    app.on("error", (error) => {
      console.log("error while talking to database", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`the port is listening on the port no  ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("error", error);
  }
})();
*/