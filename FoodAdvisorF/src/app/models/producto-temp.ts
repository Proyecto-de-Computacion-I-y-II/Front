export class ProductoTemporada {
    idTemp: number;
    producto: string;
    January: number;
    February: number;
    March: number;
    April: number;
    May: number;
    June: number;
    July: number;
    August: number;
    September: number;
    October: number;
    November: number;
    December: number;

    //De producto
    imagen: string;
    nombre:string;
    idSuper: number;
  
    [key: string]: number | string;
    
    constructor(
      idTemp: number,
      producto: string,
      January: number,
      February: number,
      March: number,
      April: number,
      May: number,
      June: number,
      July: number,
      August: number,
      September: number,
      October: number,
      November: number,
      December: number,
      imagen: string,
      nombre: string,
      idSuper: number
    ) {
      this.idTemp = idTemp;
      this.producto = producto;
      this.January = January;
      this.February = February;
      this.March = March;
      this.April = April;
      this.May = May;
      this.June = June;
      this.July = July;
      this.August = August;
      this.September = September;
      this.October = October;
      this.November = November;
      this.December = December;
      this.imagen = imagen;
      this.nombre = nombre;
      this.idSuper = idSuper;
    }
  }  