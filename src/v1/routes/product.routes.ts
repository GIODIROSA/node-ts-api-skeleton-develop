import { Router } from 'express';
import { ProductController } from '@controllers/product.controller';
import { ProductService } from '@services/product.service';
import prisma from '@config/db/prisma';

export class ProductRoutes {

  static get routes(): Router {
    const router = Router();

    const productService = new ProductService(prisma);

    const productController = new ProductController(productService);

    router.post('/', productController.createProduct);

     router.post('/bulk', productController.createMultiple);

    router.get('/', productController.getProducts);


    return router;
  }
}
