import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, unique:true},
    password: {type:String, required:true},
    role: {type:String,enum: ['buyer', 'seller'], required:true},
    verifyOtp: {type:String, default: ''},
    verifyexp: {type:Number, default: 0},
    isverify: {type:Boolean, default: false},
    resetOtp:{type:String, default: ''},
    resetexp:{type:Number, default: 0}
})
const userModel = mongoose.models.user || mongoose.model('user',userSchema);
export default userModel;