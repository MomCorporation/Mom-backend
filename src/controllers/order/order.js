import Address from "../../models/address.js";
import Branch from "../../models/branch.js"
import Order from "../../models/order.js";
import { Customer, DeliveryPartner } from "../../models/user.js"

export const createOrder = async (req,reply)=>{
    try{
        const {userId} = req.user;
        const {items , branch , totalPrice} = req.body;

        const customerData = await Customer.findById(userId)
        const branchData = await Branch.findById(branch);
        // console.log(branchData);
        
        if(!customerData){
            return reply.code(404).send({message:"Customer not found"})
        }

        const newOrder  = new Order({
            customer:userId,
            items:items.map((item)=>({
                id:item.id,
                item:item.item,
                count:item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude:customerData.liveLocation.latitude,
                longitude:customerData.liveLocation.longitude,
                address:customerData.address || "No address available"
            },
            pickupLocation:{
                latitude:branchData.location.latitude,
                longitude:branchData.location.longitude,
                address:branchData.address || "No address available"
            },
        });

        const savedOrder = await newOrder.save();
        return reply.code(201).send(savedOrder);

    }
    catch(err){
        return reply.code(500).send({message:"Failed to create order",err})
    }
}


export const confirmOrder = async (req,reply)=>{
    try {
        const {orderId} = req.params;
        const {userId} = req.user;
        const { deliveryPersonLocation } = req.body;
        
        const deliveryPerson = await DeliveryPartner.findById(userId)
        if(!deliveryPerson){
            return reply.code(404).send({message:"Delivery Person not found"})
        }

        const order = await Order.findById(orderId)
        if(!order) return reply.code(404).send({message:"Order not found"})

        if(order.status !== "available"){
            return reply.code(400).send({message:"Order is not available"})
        }

        order.status = 'confirmed'

        order.deliveryPartner = userId;
        order.deliveryPersonLocation={
            latitude:deliveryPersonLocation?.latitude,
            longitude:deliveryPersonLocation?.longitude,
            address:deliveryPersonLocation.address || ""
        }

        req.server.io.to(orderId).emit("orderConfirmed",order);

        await order.save()

        return reply.code(201).send(order)
    } catch (error) {
        return reply.code(500).send({message:"Failed to confirm order",error})
    }
}

export const updateOrderStatus = async (req,reply)=>{
    try {
        
        const {orderId} = req.params
        const {status , deliveryPersonLocation} =req.body

        const {userId} = req.user;

        const deliveryPerson = await DeliveryPartner.findById(userId)

        if(!deliveryPerson){
            return reply.code(404).send({message:"Delivery Person not found"})
        }

        const order = await Order.findById(orderId)
        if(!order) return reply.code(404).send({message:"Order not found"})

        if(['cancelled','delivered'].includes(order.status)){
            return reply.code(400).send({message:"Order cannot be updated"})
        }

        if(order.deliveryPartner.toString()!==userId){
            return reply.code(400).send({message:"Unauthorized"})
        }
          order.status = status;
          order.deliveryPersonLocation= deliveryPersonLocation;
  
          await order.save()

          req.server.io.to(orderId).emit("liveTrackingUpdates",order);

          return reply.code(201).send(order)

    } catch (error) {
        return reply.code(500).send({message:"Failed to update order status",error})
    }
}


export const getOrders  = async(req,reply)=>{
    try{
        const {status,customerId,deliveryPartnerId,branchId} = req.query;
        let query={}

        if(status){
            query.status=status
        }
        if(customerId){
            query.customer=customerId
        }
        if(deliveryPartnerId){
            query.deliveryPartner=deliveryPartnerId
            query.branch=branchId 
        }

        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
        )

        return reply.code(200).send(orders);
    }
    catch(error){
        return reply.code(500).send({message:"Failed to confirm order",error})
    }
}


export const getOrderById  = async(req,reply)=>{
    try{
        const {orderId} = req.params;

        const order = await Order.findById(order).populate(
            "customer branch items.item deliveryPartner"
        );

        if(!order){
            return reply.code(404).send({message:"Order not found"});
        }

        return reply.send(order);
    }
    catch(error){
        return reply.code(500).send({message:"Failed to confirm order",error})
    }
}

export const addAddress=async(req,reply)=>{
    try {
        // const {customerId}=req.params;
        const { customerId,fullName,country, addressLine1, addressLine2, city, postalCode, phoneNumber, isDefault } = req.body;

        // console.log("params: ",req.params)
        // console.log("userId: ",customerId)
        const newAddress = new Address({
            customerId,
            fullName,
            addressLine1,
            addressLine2,
            city,
            country,
            postalCode,
            phoneNumber,
            isDefault
        });

        await newAddress.save();

        return reply.code(201).send({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        console.error('Error adding address:', error);
        return reply.code(500).send({ message: 'Internal server error', error: error.message });
    }
}
export const getAddress = async (req, reply) => {
    try {
        console.log("req.params: ", req.params);

        const { customerId } = req.params;
        console.log("customerId: ", customerId, " type: ", typeof(customerId));

        const addresses = await Address.find({ customerId }).populate('customerId', 'fullName'); 
        console.log("Addresses: ", addresses);

        if (!addresses || addresses.length === 0) {
            return reply.code(404).send({ message: 'No addresses found for the provided customerId.' });
        }

        return reply.code(200).send({ message: 'Addresses fetched successfully', addresses });
    } catch (error) {
        console.error('Error fetching address:', error);
        return reply.code(500).send({ message: 'Internal server error', error: error.message });
    }
};
