// src/routes/product.routes.ts
import { Router } from "express";
import { ProductController } from "../controllers/product.controller"; // Ajusta la ruta si es necesario
import { ProductService } from "../services/product.service"; // Ajusta la ruta si es necesario

const router = Router();

// 1. Instanciamos las dependencias
const productService = new ProductService();
const productController = new ProductController(productService);

// 2. Definimos las rutas
// Nota: Aquí solo ponemos '/' porque el prefijo '/api/productos' lo pondremos en el index

// POST /api/productos - Crear 
router.post("/", productController.createProduct);

// GET /api/productos - Listar 
router.get("/", productController.getProducts);

export default router;
