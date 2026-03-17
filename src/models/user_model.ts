import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true,
  },
  email:{
    type:String,
    unique:true,
    required: true,
    lowercase:true
  },
  password:{
    type:String,
    required: true,
  },
  verifyOtp:{
    type:String,
    default:"",
  },
 verifyOtpExpireAt:{
  type:Date,
  default:0
 },
isAccountVerified:{
  type:Boolean,
  default:false
},
resetOtp:{
  type:String,
  default:""
},
resetOtpExpireAt:{
  type:Date,
  default:0
},
createdAt:{
  type:Date,
  default:Date.now
},
profileImage:{
type:String,
default:""
}
})

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);
export default UserModel
