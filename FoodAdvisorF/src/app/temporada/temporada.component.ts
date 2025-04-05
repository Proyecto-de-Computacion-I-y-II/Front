import { Component } from '@angular/core';
import { ProductoTemporada } from '../models/producto-temp';
import { ProductoTempService } from '../services/producto-temp.service';

@Component({
  selector: 'app-temporada',
  standalone: false,
  templateUrl: './temporada.component.html',
  styleUrls: ['./temporada.component.css']
})
export class TemporadaComponent {

  products: ProductoTemporada[] = [];
  meses = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentMonth: string = ''; // Variable para almacenar el mes actual
  productosFiltrados: ProductoTemporada[] = [];
  productosSaliendo: ProductoTemporada[] = []; // Arreglo para productos que salen

  constructor(private productoTempService: ProductoTempService) { }

  ngOnInit(): void {
    // Obtener el mes actual
    const mesIndex = new Date().getMonth(); // Obtiene el mes actual (0 - 11)
    this.currentMonth = this.meses[mesIndex]; // Asigna el nombre del mes actual

    this.productoTempService.getAllProductosTemp().subscribe(
      (data: any) => {
        console.log('Datos obtenidos:', data);  // Verifica la estructura de los datos
        // Accede al arreglo dentro de la propiedad 'productos'
        this.products = Array.isArray(data.productos) ? data.productos : [];  
        console.log('Productos:', this.products);  // Verifica que ahora sea un arreglo

        // Filtra los productos que tienen un 1 en el mes actual (productos disponibles)
        this.productosFiltrados = this.products.filter(producto =>
          producto[this.currentMonth] === 1
        );

        // Filtra los productos que tienen un 0 en el mes actual (productos que salen)
        this.productosSaliendo = this.products.filter(producto =>
          producto[this.currentMonth] === 0
        );
      },
      (error) => {
        console.error('Error al obtener los productos de temporada', error);
      }
    );
  }
}