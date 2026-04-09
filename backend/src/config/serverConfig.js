require("dotenv").config();

module.exports  = {
    PORT : process.env.PORT || 3001,
    MONGO_URI : process.env.MONGO_URI,
    EMAIL_PORT : process.env.EMAIL_PORT,
    EMAIL_HOST : process.env.EMAIL_HOST,
    EMAIL_USER : process.env.EMAIL_USER,
    EMAIL_PASS : process.env.EMAIL_PASS,
    ALLOWED_DOMAIN : process.env.ALLOWED_DOMAIN,
    JWT_SECRET : process.env.JWT_SECRET,
    JWT_VERIFY_EXPIRES_IN : process.env.JWT_VERIFY_EXPIRES_IN,
    JWT_SESSION_EXPIRES_IN : process.env.JWT_SESSION_EXPIRES_IN,
    CLIENT_URL : process.env.CLIENT_URL,
    GEMINI_API_KEY : process.env.GEMINI_API_KEY,
    FRONTEND_URL : process.env.FRONTEND_URL
};