require("dotenv").config();

module.exports  = {
    PORT : process.env.PORT || 3001,
    MONGO_URI : process.env.MONGO_URI,
    EMAIL_PORT : process.env.EMAIL_PORT,
    EMAIL_HOST : process.env.EMAIL_HOST,
    EMAIL_USER : process.env.EMAIL_USER,
    EMAIL_PASS : process.env.EMAIL_PASS,
};