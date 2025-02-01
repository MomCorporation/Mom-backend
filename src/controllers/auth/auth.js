import { Customer, DeliveryPartner} from "../../models/user.js";
import jwt from "jsonwebtoken";

const generateTokens = (user)=>{
    const accessToken = jwt.sign(
        {userId:user._id, role:user.role},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn :"1d"}
    );

    const refreshToken = jwt.sign(
        {userId:user._id , role:user.role},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:"1d"}
    );

    return {accessToken , refreshToken}
}

export const loginCustomer = async (req,reply)=>{
    try{
        const {phone,liveLocation} = req.body;
        let customer = await Customer.findOne({phone});

        if(!customer){
            customer = new Customer({
                phone,
                role:"Customer",
                isActivated:true,
                liveLocation
            });
            await customer.save();
        }

        const {accessToken , refreshToken} = generateTokens(customer);
        return reply.code(200).send({
            message:customer ? "Login Successful" :"Customer created and logged in",
            accessToken,
            refreshToken,
            customer,
        });

    }
    catch(error){
        return reply.code(500).send({message:"An error occured",error});
    }
};

export const loginDeliveryPartner = async (req,reply)=>{
    try{
        const {email,password} = req.body;
        const deliveryPartner = await DeliveryPartner.findOne({email});

        if(!deliveryPartner){
            return reply.code(404).send({message:"Delivery Partner not found"});
        }

        const isMatch = password === deliveryPartner.password

        if(!isMatch){
            return reply.code(400).send({message:"Invalid Credentials"});
        }

        const {accessToken , refreshToken} = generateTokens(deliveryPartner);
        return reply.code(200).send({
            message: "Login Successful" ,
            accessToken,
            refreshToken,
            deliveryPartner,
        });

    }
    catch(error){
        return reply.code(500).send({message:"An error occured",error});
    }
};

export const refreshToken = async (req,reply)=>{
    const {refreshToken} = req.body;

    if(!refreshToken){
        return reply.code(401).send({message:"Refresh token required"})
    }

    try{

        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        let user;

        if(decoded.role === "Customer"){
            user = await Customer.findById(decoded.userId);
        }else if(decoded.role === "DeliveryPartner"){
            user = await DeliveryPartner.findById(decoded.userId);
        }else{
            return reply.code(403).send({message:"Invalid Role"})
        }

        if(!user){
            return reply.code(403).send({message:"Invalid refresh token"})
        }

        const {accessToken , refreshToken:newRefreshToken} = generateTokens(user);
        return reply.code(200).send({
            message:"Token Refreshed",
            accessToken,
            refreshToken:newRefreshToken,
        });

    }catch(error){
        return reply.code(403).send({message:"Invalid Refresh Token"})
    }

}

export const fetchUser = async(req,reply)=>{
    try{
        const {userId , role } = req.user;
        let user;

        if(role === "Customer"){
            user = await Customer.findById(userId);
        }else if(role === "DeliveryPartner"){
            user = await DeliveryPartner.findById(userId);
        }else
        {
            return reply.code(403).send({message:"Invalid Role"});
        }

        if(!user){
            return reply.code(404).send({message:"User not found"})
        }

        return reply.code(200).send({
            message:"User fetched successfully",
            user,
        })

    }
    catch(error)
    {
        return reply.code(500).send({message:"An error occured",error});
    }
}