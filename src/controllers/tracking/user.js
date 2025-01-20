import { Customer, DeliveryPartner} from "../../models/index.js";

export const updateUser = async (req, reply)=>{
    try{
        const{userId} = req.user;
        const updateData = req.body;

        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

        if(!user){
            return reply.code(404).send({message:"User not found"});
        }

        let UserModel;

        if(user.role === "Customer"){
            UserModel = Customer;
        }else if(user.role === "DeliveryPartner"){
            UserModel = DeliveryPartner;
        }else{
            return reply.code(400).send({message:"Invalid user role"});
        }
        
        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set : updateData},
            { new : true,runValidators:true }
        );

        if(!updateUser){
            return reply.code(404).send({message:"User not found"});
        }

        return reply.code(201).send({
            message:"User updated successfully",
            user:updateUser,
        });
    }
    catch(error){
        return reply.code(500).send({message:"Failed to update user",error});
    }
}