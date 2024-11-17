import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// app.listen(process.env.PORT || 8000 , ()=>{
  //     console.log(`the server is listening at the port ${process.env.PORT}`);
  // })
  
  const app = express();
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   }),
// );
// app.use(
//   express.json({
//     limit: "16kb",
//   }),
// );
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(cookieParser);
// app.use(express.static("public"));
export { app };
