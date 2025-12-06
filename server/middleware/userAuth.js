import jwt from 'jsonwebtoken';  

const userAuth = async (req, res, next)=>{
    const {token} = req.cookies;
    
    if(!token){
        return res.json({success: false, message :'not authorized login again'})
    }
    try {
        
        const tokenDecode =jwt.verify(token,process.env.JWT_SECRET);
        console.log(tokenDecode);
        if(tokenDecode.id){
            req.user = { id: tokenDecode.id };
            console.log("Here1");
        }else{
            console.log("Here");
            return res.json({success: false, message :'not authorized login again'})
        }
        next();
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
export default userAuth;