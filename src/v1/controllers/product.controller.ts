import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  constructor(
    private readonly productService: ProductService = new ProductService()
  ) {}

  // -- CREACIÓN (POST)
  public createProduct = (req: Request, res: Response) => {
    const { nombre, descripcion, precio, stock } = req.body;

    this.productService
      .createProduct({ nombre, descripcion, precio, stock })
      .then((product) => {
        res.status(201).json(product);
      })
      .catch((error) => {
        // ERROR: si es validación (status 400) o error del servidor (500)

        const status = error.status || 500;
        res
          .status(status)
          .json({ message: error.message || "Error interno del servidor." });
      });
  };

  // -- LISTADO (GET)

  public getProducts = (req: Request, res: Response) => {
    this.productService
      .getAllProducts()
      .then((products) => {
        res.status(200).json(products);
      })
      .catch((error) => {
        const status = error.status || 500;
        res
          .status(status)
          .json({ message: error.message || "Error interno del servidor." });
      });
  };

  
}
