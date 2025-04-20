export interface ProductoEnCesta {
    ID_prod: number;
    cantidad: number;
    recomendado: boolean;
    comprado: boolean;
    deleted_at: string | null;
  }