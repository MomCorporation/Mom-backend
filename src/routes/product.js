import { getAllCategories } from "../controllers/product/category.js";
import { getProductsByCategoryId } from "../controllers/product/product.js";

export const categoryRoutes = async (fastify,options)=>{
    fastify.get("/categories",getAllCategories);
}

export const productRoutes = async (fastify ,options)=>{
    fastify.get("/products/:categoryId" , getProductsByCategoryId);
}