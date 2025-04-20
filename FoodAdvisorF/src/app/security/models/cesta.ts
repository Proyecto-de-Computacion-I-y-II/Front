import { ProductoEnCesta } from './productoEnCesta';
export interface Cesta {
    ID_cesta: number;
    ID_user: number;
    fecha_compra: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    ProductoEnCestas?: ProductoEnCesta[];
    totalProductoEnCestas?: number;
  }