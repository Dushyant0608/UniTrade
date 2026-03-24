const User = require("../models/usermodel");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendVerificationEmail } = require("../utils/sendEmail");
const {
    JWT_SECRET,
    JWT_VERIFY_EXPIRES_IN,
    JWT_SESSION_EXPIRES_IN,
    CLIENT_URL,
    ALLOWED_DOMAIN
} = require("../config/serverConfig");


/**
 * - SignUp Controller
 * - POST api/auth/signup
 */
const signup = asyncHandler(async(req,res) => {
    const { name , email , password , signupTags } = req.body;


    if(!name || !email || !password ) {
        throw new AppError("Name, email and password is invalid", 400);
    }

    if(!email.endsWith(ALLOWED_DOMAIN)){
        throw new AppError(`Only ${ALLOWED_DOMAIN} emails are allowed` , 400);
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new AppError("Email is already registered",400);
    } 

    const user = await User.create({
        name,
        email,
        password,
        signupTags : signupTags || []
    });

    const verificationToken = jwt.sign(
        {userId : user._id},
        JWT_SECRET,
        {expiresIn : JWT_VERIFY_EXPIRES_IN}
    );

    await Token.create({
        userId : user._id,
        token : verificationToken,
        expiresAt : new Date(Date.now() + 60*60*1000)
    });

    const verificationLink = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;
    await sendVerificationEmail(email, name, verificationLink);

    res.status(201).json({
        success : true,
        message : "Registration successful. Please check your email to verify your account."
    });
});

/**
 * - Verify Controller
 * - GET api/auth/verify/:token
 */

const verifyEmail = asyncHandler(async(req,res)=>{
    const {token} = req.params;

    let decode;
    try {
        decode = jwt.verify(token , JWT_SECRET);
    } catch (error) {
        throw new AppError("Verification link is invalid or has expired", 400);
    }

    const savedToken = await Token.findOne({
        token : token,
        userId : decode.userId
    });


    if(!savedToken) {
        throw new AppError("Verification link is invalid or has expired", 400);
    }

    await User.findByIdAndUpdate(decode.userId, {isVerified : true});

    await Token.findByIdAndDelete(savedToken._id);

    res.status(200).json({
        success : true,
        message : "Email verified successfully. You can now log in."
    });
});

/**
 * - Login Controller
 * - POST api/auth/login
 */

const login = asyncHandler(async(req,res)=>{
    const { email , password} = req.body;

    if(!email || !password){
        throw new AppError("Email and password are required" , 400);
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        throw new AppError("Invalid email or password",401);
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        throw new AppError("Invalid email or password",401);
    }

    if (!user.isVerified) {
        throw new AppError("Please verify your email before logging in", 401);
    }

    const sessionToken = jwt.sign(
        {userId : user._id},
        JWT_SECRET,
        {expiresIn : JWT_SESSION_EXPIRES_IN}
    );

    res.cookie("token" , sessionToken , {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "strict",
        maxAge : 7*24*60*60*1000
    });

    res.status(200).json({
        success : true,
        message : "Logged in successfully",
        user : {
            _id        : user._id,
            name       : user.name,
            email      : user.email,
            signupTags : user.signupTags,
            isVerified : user.isVerified
        } 
    });
});

/**
 * - Logout Controller
 * - api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    // Overwrite the cookie with a blank string and expire it immediately
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0) // Sets expiration date to the past (Jan 1, 1970)
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = { signup, verifyEmail, login, logout }