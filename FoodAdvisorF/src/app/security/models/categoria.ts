import {Subcategoria} from "./subcategoria";

export interface Categoria {
    id: number;
    nombre: string;
    subcategorias: Subcategoria[];
}
