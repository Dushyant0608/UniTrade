const nodemailer  = require("nodemailer");
const {EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS} = require("../config/serverConfig");

const transporter = nodemailer.transporter({
    host : EMAIL_HOST,
    port : EMAIL_PORT,
    secure : false,
    auth : {
        user : EMAIL_USER,
        pass : EMAIL_PASS
    }
});

transporter.verify( (error) => {
    if(error){
        console.error("Email Server connection failed: ",error);
    } else {
        console.log("Email Server is Working")
    }
});

const sendEmail = async ({to,subject,html}) => {
    await transporter.sendMail({
        from : `"UniTrade" <${EMAIL_USER}>` ,
        to,
        subject ,
        html 
    });
};

const sendVerificationEmail = async (email, name, verificationLink) => {
    await sendEmail({
        to      : email,
        subject : "Verify your UniTrade account",
        html    : `
            <h2>Welcome to UniTrade, ${name}!</h2>
            <p>You are one step away from accessing the IIIT Manipur campus marketplace.</p>
            <p>Click the link below to verify your account.</p>
            <p>This link expires in <strong>1 hour.</strong></p>
            <a href="${verificationLink}"
               style="
                 display: inline-block;
                 padding: 10px 20px;
                 background-color: #C0504D;
                 color: white;
                 text-decoration: none;
                 border-radius: 5px;
               ">
               Verify My Account
            </a>
            <p>If you did not sign up for UniTrade, ignore this email.</p>
        `
    });
};

module.exports = { sendVerificationEmail };
