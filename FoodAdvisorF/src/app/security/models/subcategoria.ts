import {Subcategoria2} from './subcategoria2';

export interface Subcategoria {
  id: number;
  nombre: string;
  subcategorias2?: Subcategoria2[];
}
