import { GetProductOptions, createProductDTO } from "@interfaces/product/product.types";
import { Prisma, PrismaClient } from "@prisma/client";
import { skip } from "@prisma/client/runtime/library";

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

  // 2. Carga masiva de productos POST /bulk

 public async createMultipleProducts(products: createProductDTO[]) {

  // 1. Validación inicial del array
  if (!Array.isArray(products) || products.length === 0) {
    throw {
      status: 400,
      message: "Se debe proporcionar un array de productos para la carga masiva.",
    };
  }

  // 2. Bucle de Validación (Solo verifica datos, no inserta)
  products.forEach((product, index) => {
    
    // Validar nombre
    if (!product.nombre || product.nombre.trim() === "") {
      throw {
        status: 400,
        message: `El nombre del producto en la posición ${index} no puede estar vacío.`,
      };
    }

    // Validar precio exista y sea número
    if (product.precio === undefined || typeof product.precio !== 'number') {
      throw {
        status: 400,
        message: `El precio del producto en la posición ${index} debe ser un número válido.`,
      };
    }

    // Validar stock entero positivo
    if (product.stock < 0 || !Number.isInteger(product.stock)) {
      throw {
        status: 400,
        message: `El stock del producto en la posición ${index} debe ser un número entero positivo.`,
      };
    }
    //final del forEach
  });



  // 3. Inserción Masiva (Se ejecuta UNA vez, fuera del bucle)
  try {
    const result = await this.prisma.product.createMany({
      data: products.map((p) => ({
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
      })),
      skipDuplicates: true,
    });
    
    // Opcional: Retornar el resultado
    console.log('Carga masiva completada:', result);
    return result; 

  } catch (error) {
    // Es recomendable loguear el error aquí o lanzar una excepción controlada
    console.error('Error creando productos:', error);
    throw {
      status: 500,
      message: 'Error interno al procesar la carga masiva de productos.',
    };
  }
}

  // 3. Obtener todos los productos GET

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
