import { GetProductOptions } from "@interfaces/product/product.types";
import { Prisma, PrismaClient } from "@prisma/client";

export class ProductService {
  constructor(private readonly prisma: PrismaClient) {}

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
      const newProduct = await this.prisma.product.create({
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

  public async getProducts(options: GetProductOptions) {
    const { page, limit, nombre } = options;

    // Cálculo del Offset (cuántos registros saltar)
    const skip = (page - 1) * limit;

    // Condición de búsqueda por nombre (si se proporciona)
    const where: Prisma.ProductWhereInput = nombre
      ? { nombre: { contains: nombre, mode: "insensitive" } }
      : {};

    // -- Obtener de la DB --
    try {
      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip: skip,
          take: limit,
          orderBy: { id: "asc" },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      throw {
        status: 500,
        message: "Error interno del servidor al obtener los productos.",
      };
    }
  }
}
