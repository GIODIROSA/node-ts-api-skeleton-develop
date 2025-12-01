import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
          .json({ error: error.message || "Error interno del servidor." });
      });
  };

  // -- CREACIÓN MÚLTIPLE (POST / BULK)
  public createMultiple = (req: Request, res: Response) => {
    // Esperamos un array de product
    const products = req.body;

    this.productService
      .createMultipleProducts(products)
      .then((result) => res.status(201).json(result))
      .catch((error) => {
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
      });
  };

  // -- LISTADO (GET)

  public getProducts = (req: Request, res: Response) => {
    // 1. Extraer Query Params (lo que viene después del ? en la URL)
    const { page = 1, limit = 10, nombre } = req.query;

    // 2. Convertir a números (vienen como strings)
    // +page convierte "1" a 1. Si no es número, usa el default.
    const pageNumber = +page > 0 ? +page : 1;
    const limitNumber = +limit > 0 ? +limit : 10;

    // 3. Llamar al servicio con los filtros
    this.productService
      .getProducts({
        page: pageNumber,
        limit: limitNumber,
        nombre: nombre as string, // Puede ser undefined
      })
      .then((products) => res.json(products))
      .catch((error) =>
        res
          .status(500)
          .json({ error: error.message || "Error al obtener productos" })
      );
  };
}
