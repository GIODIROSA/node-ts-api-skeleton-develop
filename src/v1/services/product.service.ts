import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProductService {
  constructor() {}

  public async createProduct(data: {
    nombre: string;
    precio: number;
    descripcion?: string;
    stock: number;
  }) {
    // Validar nombre vacio
    if (!data.nombre || data.nombre.trim() === "") {
      throw {
        status: 400,
        message: "El nombre del producto no puede estar vacío.",
      };
    }

    // Validar stock entero positivo
    if (data.stock < 0 || !Number.isInteger(data.stock)) {
      throw {
        status: 400,
        message: "El stock debe ser un número entero positivo.",
      };
    }

    // -- Guardar en DB --
    try {
      const newProduct = await prisma.product.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          stock: data.stock,
        },
      });
      return newProduct;
    } catch (error) {
      console.log(error);
      console.error("Error al crear el producto:", error);
      throw {
        status: 500,
        message: "Error interno del servidor al crear el producto.",
      };
    }
  }

  // 2. Obtener todos los productos GET

  public async getAllProducts() {
    const products = await prisma.product.findMany();
    return products;
  }
}


