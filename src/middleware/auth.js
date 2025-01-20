import jwt from 'jsonwebtoken'

export const verifyToken = async (req,reply)=>{
    try {

        const authHeader = req.headers["authorization"];
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return reply.code(401).send({message:"Access token required"})
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        return true;

    } catch (err) {
        return reply.code(403).send({message:"Invalid or Expired token"})
    }
}