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

  constructor(private productoTempService: ProductoTempService) { }

  ngOnInit(): void {
    // Obtener el mes actual
    const monthIndex = new Date().getMonth(); // Obtiene el mes actual (0 - 11)
    this.currentMonth = this.meses[monthIndex]; // Asigna el nombre del mes actual

    this.productoTempService.getAllProductosTemp().subscribe(
      (data: any) => {
        console.log('Datos obtenidos:', data);  // Verifica la estructura de los datos
        // Accede al arreglo dentro de la propiedad 'productos'
        this.products = Array.isArray(data.productos) ? data.productos : [];  
        console.log('Productos:', this.products);  // Verifica que ahora sea un arreglo

        // Filtra los productos que tienen un 1 en el mes actual
        this.productosFiltrados = this.products.filter(producto =>
          producto[this.currentMonth] === 1
        );
      },
      (error) => {
        console.error('Error al obtener los productos de temporada', error);
      }
    );
  }
}