import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.cookies);
  res.status(200).json({
    message: "set ja raha ha choudry",
  });
});
export { registerUser };
