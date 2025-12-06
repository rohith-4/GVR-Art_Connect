import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import Seller from '../models/sellerModel.js';
import Buyer from '../models/buyerModel.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req,res)=>{
    const {name, email, password, role} = req.body;
    if(!name || !email || !password || !role){
        return res.json({success:false,message:"Missing details"})
    }
    try{
        const existingUser =await userModel.findOne({email})
        if(existingUser){
            return res.json({success: false,message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name,email,password: hashedPassword,role});
        await user.save();
        if (role === 'seller') await Seller.createFromUser(user);
        else if (role === 'buyer') await Buyer.createFromUser(user);

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'15d'});
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject:"welcome to art gallery",
            text:`welcome to website. your account is created with this email:${email}`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success: true});
    }catch(error){
        res.json({success: false, message:error.message});
    }
}
export const login = async (req, res) => {
  try {
    console.log('POST /api/auth/login body:', req.body);

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await userModel.findOne({ email }).select('+password').lean();
    if (!user) {
      console.log('login: user not found for', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If you stored hashed password and didn't implement comparePassword, use bcrypt.compare
    const hashed = user.password;
    if (!hashed) {
      console.error('login: user record missing password hash', user._id);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const passwordMatches = await bcrypt.compare(password, hashed);
    if (!passwordMatches) {
      console.log('login: invalid password for', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in env');
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // send cookie
    res.cookie('token', token, COOKIE_OPTS);

    const safeUser = { _id: user._id, name: user.name, email: user.email };
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('login error stack:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const logout = async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'? 'none':'strict',
        })
        return res.json({success:true, message: "logged out"})
    }catch(error){
        res.json({success: false, message:error.message})
    }
}

export const sendVerifyOtp= async (req,res)=>{
    try{
        const userId = req.user.id;
        //we cannot directly get the userId so we will fetch it from token which is in cookies wee will usie middleware

        const user = await userModel.findById(userId);
        if(user.isverify){
            return res.json({success: false, message:"account already verified"})
        }

        const otp=String(Math.floor(100000+ Math.random()*900000));
        user.verifyOtp =otp;
        user.verifyexp = Date.now()+ 24*60*60*1000
        await user.save();
        const mailOption={
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject:"Account Verification OTP",
            text:`Your OTP IS ${otp}. Verify your account using this OTP`
        }
        await transporter.sendMail(mailOption);
        res.json({success:true,message:'verification otp sent on email'});
    }catch(error){
        res.json({success: false, message:error.message});
    }
}

export const verifyEmail = async(req,res)=>{
    const {otp} = req.body;
    const userId = req.user.id;
    if(!userId || !otp){
        return res.json({success:false, message:'missing details'});
    }
    try{
        const user= await userModel.findById(userId);
        if(!user){
            return res.json({success: false, message:'user not found'});
        }
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({ success : false, message: 'Invalid OTP'});
        }
        if(user.verifyexp< Date.now()){
            return res.json({success: false, message:'OTP expired'});
        }
        user.isverify=true;
        user.verifyOtp='';
        user.verifyexp=0;
        await user.save();
        res.json({success:true,message:'otp verified successfully'});
    }catch(error){
        res.json({success: false, message:error.message});
    }
}

export const isAuthenticated = async (req,res)=>{
    try {
        return res.json({ success: true});
    } catch(error){
        res.json({success: false, message: error.message});
    }
}

export const sendResetOtp = async (req,res)=>{
    const{email}= req.body;
    if(!email){
        return res.json({success:false, message: 'email is required'})
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message: 'user not found'})
        }

        const otp=String(Math.floor(100000+ Math.random()*900000));
        user.resetOtp =otp;
        user.resetexp = Date.now()+  15*60*1000
        await user.save();
        const mailOption={
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject:"Password reset email",
            text:`Your OTP is ${otp}. Reset the password of the account using this OTP`
        }
        await transporter.sendMail(mailOption);
        res.json({success:true,message:'Reset password otp sent on email'});
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}

//reset user password
export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false, message: 'Email, OTP and new password required'});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false,message:'user not found'});
        }
        if(user.resetOtp=== "" || user.resetOtp !==otp){
            return res.json({success: false, message:"Invalid OTP"});
        }

        if(user.resetexp< Date.now()){
            return res.json({success: false, message:'OTP Expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOtp='';
        user.resetexp= 0;
        await user.save();
        return res.json({success: true,message: 'password hasbeen reset successfully'});   
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}

export const getMe = async (req, res) => {
  try {
    console.log('/api/auth/me called - req.user:', !!req.user, 'cookies:', req.cookies ? Object.keys(req.cookies) : null);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = { ...req.user };
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    console.error('getMe error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

