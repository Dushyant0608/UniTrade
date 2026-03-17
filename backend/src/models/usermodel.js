const mongoose = require("mongoose");
const bcrypt  = require("bcryptjs");

const viewHistoryTagSchema = new mongoose.Schema({
    tag : {
        type : String,
        required : true,
        trim : true
    },

    lastSeen : {
        type : Date,
        required : true,
        default : Date.now
    }
} , { _id : false}
);

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required  : [true , "Name is required"],
        trim  : true
    },

    email : {
        type : String,
        required : [true , "Email is required"],
        unique : true,
        lowercase : true,
        trim : true
    },

    password : {
        type : String,
        required : [true , "Password is required"],
        minlength : [6, "Password must of 6 characters"],
        select : false
    },

    isVerified : {
        type : Boolean,
        default  : false
    },

    signupTags : {
        type : [String],
        default : []
    },

    viewHistoryTags : {
        type : [viewHistoryTagSchema],
        default : []
    }
} , {timestamps : true}

);

userSchema.pre("save" , async function () {
    if(!this.isModified("password")){
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password , this.password);
};



const userModel = mongoose.model("User" , userSchema);

module.exports = userModel;