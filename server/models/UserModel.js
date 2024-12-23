import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        require:[true, "Cần phải có Email."],
        unique: true,
    },
    password:{
        type:String,
        require:[true, "Cần phải có Password."],
    },
    firstName:{
        type:String,
        require:false,
    },
    lastName:{
        type:String,
        require:false,
    },
    image:{
        type:String,
        require:false,
    },
    color:{
        type:Number,
        require:false,
    },
    profileSetup:{
        type: Boolean,
        default: false,
    },
});


userSchema.pre("save", async function(next) {
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
});

const User = mongoose.model("Users", userSchema);

export default User;