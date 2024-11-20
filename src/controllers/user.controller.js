import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// method to create the access and refresh token

const createAcessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    console.log(user);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validatBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "error while genrating access and refresh token");
  }
};

// register user
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
  const exsistedUser = await User.findOne({
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
  if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
    coverimageLocalPath = req.files.coverImage[0].path;
  }

  if (!avtarimageLocalPath) {
    throw new ApiErrors(400, "avtar image is required");
  }
  const avtar = await uploadToCloudinary(avtarimageLocalPath);
  const image = await uploadToCloudinary(coverimageLocalPath);
  console.log("this is the response from the cloudinary response ", avtar);
  if (!avtar) {
    throw new ApiErrors(500, "something went wrong while uploading the image");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    avtar: avtar.url,
    coverImage: image?.url || "",
    username: username.toLowerCase(),
  });
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!userCreated) {
    throw new ApiErrors(
      500,
      "something went wrong while registering the user into database",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userCreated, "user created successfully"));
});

// login user

const loginUser = asyncHandler(async (req, res) => {
  // steps while login the user

  // get data from request body
  // extract email and username and password
  // check either the username or email or in not empty
  // check the username and email in db
  // check the password
  // genrate refresh token and access token
  // send them via cookies

  const { username, email, password } = req.body;
  console.log(req.body);
  if (!username && !email) {
    throw new ApiErrors(400, "plz enter the username and email");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiErrors(401, "User does not exist");
  }
  const userValid = await user.isPasswordCorrect(password);
  if (!userValid) {
    throw new ApiErrors(409, "password is incorrect");
  }
  const { accessToken, refreshToken } = await createAcessAndRefreshToken(
    user._id,
  );
  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  const options = {
    httponly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "user Logged in successfully",
      ),
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  // now because we know that we added the user field to the req so now we have full access to the user so we can get the user id and delete its refresh token

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httponly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully "));
});

//  refresh token
const genrateTokens = asyncHandler(async (req, res) => {
  // first step to get the refresh token from the request
  // verify the tokens using the jsonwebtoken
  // becaus the refresh token has also some payload so collect the user id
  // call database and get the user refresh token compare both
  // compare both tokens
  // genrate tokens

  const incommingToken = req.cookies?.refreshToken || req.body.refreshToken;
  console.log(incommingToken);
  console.log("this is the body of the request");
  console.log(req.body);
  if (!incommingToken) {
    throw new ApiErrors(400, "no token recieved");
  }
  const decodedToken = jwt.verify(
    incommingToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  console.log(decodedToken);
  if (!decodedToken) {
    throw new ApiErrors(400, "invalid token");
  }
  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiErrors(400, "USER not found according to that refreshToken");
  }

  const { refreshToken, accessToken } = await createAcessAndRefreshToken(
    user?._id,
  );

  // cookie options actually tells us about the behaviour of the cookies
  const options = {
    httponly: true,
    secure: true,
  };
  if (incommingToken !== user?.refreshToken) {
    throw new ApiErrors(400, "unaturized access token");
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { refreshToken, accessToken },

        "your access and refresh tokens are created successfully",
      ),
    );
});

// update the password of the user
const updateCurrentPassword = asyncHandler(async (req, res) => {
  // to change the password we must have the current password and new password
  // because we know if the user is logind then he can chage the password so when he send request we can collect the access token by using auth middleware and then we can add the user to the request
  const { password, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const validPassword = user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiErrors(400, "your password is incorrect");
  }
  user.password = password;
  await user.save({validatBeforeSave:false})
  return res
  .status(200)
  .json(new ApiResponse(200, {}, "your password edited successfully"))
});

// get current user information
const getCurrentUser = asyncHandler(async (req, res) => {
      return res
      .status(200)
      .json(new ApiResponse(200, req.user, "current user "))
})

// update the account details 
const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;
    if(!fullName || !email){
      throw new ApiErrors(400, "email and fullName is requiered")
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          fullName,
          email: email
        }
      },
      {new : true }
    ).select("-password")

    if (!user) {
      throw new ApiErrors(500, "something went wrong")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))


})

// update the avtar of the user 
const updateAvtar = asyncHandler ( async (req, res) => {
  // because this request comes from the two requests so it have the user informatin along with image file so we can access both 
  // so i know in database we use only the link so first we have to upload this file to cloudinary and then send the link to the file 
  const localfilePath = req.file.path;
  if (!localfilePath) {
    throw new ApiErrors(400, "local file path not found ")

  }
  const cloudinaryResponse = await uploadToCloudinary(localfilePath)
  if (!cloudinaryResponse) {
    throw new ApiErrors(400, "somethig went wrong while uploading the file to cloudinary")
  }
  const user = await User.findById(req.user?._id).select("-password")
  if (!user) {
    throw new ApiErrors(400, "user not found ")
  }
  user.avtar = cloudinaryResponse.url;
  await user.save({validatBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200, user, "avtar changed successfully"))
})

// to update the user cover image
const updateUserCoverImage = asyncHandler ( async (req, res) => {
  // because this request comes from the two requests so it have the user informatin along with image file so we can access both 
  // so i know in database we use only the link so first we have to upload this file to cloudinary and then send the link to the file 
  const localfilePath = req.file?.path;
  if (!localfilePath) {
    throw new ApiErrors(400, "local file path not found ")

  }
  const cloudinaryResponse = await uploadToCloudinary(localfilePath)
  if (!cloudinaryResponse.url) {
    throw new ApiErrors(400, "somethig went wrong while uploading the file to cloudinary")
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {$set: {
      coverImage: cloudinaryResponse.url
    }},
    {
      new: true
    }
  ).select("-password")
  if (!user) {
    throw new ApiErrors(400, "user not found ")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, user, "avtar changed successfully"))
})
export { registerUser, loginUser, logoutUser, genrateTokens,updateCurrentPassword, getCurrentUser,updateAccountDetails,updateAvtar,updateUserCoverImage };
