const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const { JWT_SECRET } = require("../config/serverConfig");

const protect = asyncHandler(async (req, res, next) => {

    // Step 1 — Check token exists in cookie
    const token = req.cookies.token;
    if (!token) {
        throw new AppError("You are not logged in", 401);
    }

    // Step 2 — Verify JWT
    // jwt.verify throws if token is invalid or expired
    // We catch it and throw a clean AppError
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new AppError("Session expired, please login again", 401);
    }

    // Step 3 — Find user from token payload
    const user = await User.findById(decoded.userId);
    if (!user) {
        throw new AppError("User no longer exists", 401);
    }

    // Step 4 — Check user is still verified
    // Edge case — admin could unverify a user after they logged in
    if (!user.isVerified) {
        throw new AppError("Your account is not verified", 401);
    }

    // Step 5 — Attach user to request object
    // Every protected route can now access req.user
    req.user = user;

    // Step 6 — Continue to the route
    next();
});

module.exports = { protect };