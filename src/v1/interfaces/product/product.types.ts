export interface GetProductOptions {
  page: number;
  limit: number;
  nombre?: string;
}

export interface createProductDTO {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}