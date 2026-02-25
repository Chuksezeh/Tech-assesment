import rawProducts from "../data/products.json";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
};

const products: Product[] = rawProducts as Product[];

export const getProducts = async (): Promise<Product[]> => {
  return products;
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  return products.find((product) => product.id === id);
};