import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/apiResponse.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "set ja raha ha choudry",
  // });

  // these are some steps taht is must be cnsidered when we are going to create the user
  // get the data from the fronend
  // 0. check if the fields are not emppy

  // 1. check if the user is already exist
  // 2. if not then create the user
  // 4. take images and avtar
  // upload images to the cloudnery
  // run the commands to create the users in db
  // from response remove the password and email and refresh token
  // send the response to the frontend



  const { fullName, email, password, username } = req.body;
  // console.log("yes this can be happen");
  // console.log(req);
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "all fields are required");
  }
  // console.log(email, "email");
  const exsistedUser = await  User.findOne({
    $or: [{ email }, { username }],
  });
  if (exsistedUser) {
    throw new ApiErrors(409, "user is already existed");
  }
  console.log("this is the req.files data ", req.files);
  const avtarimageLocalPath = req.files?.avtar[0]?.path; // bcz in avtar is the array of objects according to over multer middleware maxcount that tells us how many files we can upload so here in this case we only upload a single file so we can access that file object on index [0]
  // console.log(avtarimageLocalPath);

  // here a issue maybe emerged like maybe some user only want to share the avtar image so we need to check if the cover image is uploaded or not
  //const coverimageLocalPath = req.files?.coverImage[0]?.path; // this can be usefull if the both avtar and coverImage are required but here is not requiered so need to check it in classic js

  let coverimageLocalPath;
  if(req.files && req.files.coverImage && req.files.coverImage.length  > 0){
    coverimageLocalPath = req.files.coverImage[0].path;
  }

  if(!avtarimageLocalPath)
  {
    throw new ApiErrors(400, "avtar image is required");
  }
 const avtar= await uploadToCloudinary(avtarimageLocalPath);
 const image= await uploadToCloudinary(coverimageLocalPath);
 console.log("this is the response from the cloudinary response " ,avtar);
 if(!avtar){
  throw new ApiErrors(500, "something went wrong while uploading the image");
 }
 const user = await User.create({
  fullName,
  email,
  password,
  avtar: avtar.url,
  coverImage: image?.url || "",
  username : username.toLowerCase()

 })
 const userCreated =await User.findById(user._id).select(
  "-password -refreshToken"
 )
 if(!userCreated){
  throw new ApiErrors(500, "something went wrong while registering the user into database")

 }

 return res.status(200).json(
    new ApiResponse(200, userCreated, "user created successfully")
 )

});
export { registerUser };
