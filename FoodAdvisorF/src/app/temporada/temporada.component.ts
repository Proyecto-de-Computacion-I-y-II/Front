import { Component, OnInit } from '@angular/core';
import { ProductoTemporada } from '../models/producto-temp';
import { ProductoTempService } from '../services/producto-temp.service';

@Component({
  selector: 'app-temporada',
  standalone: false,
  templateUrl: './temporada.component.html',
  styleUrls: ['./temporada.component.css']
})
export class TemporadaComponent implements OnInit {

  products: ProductoTemporada[] = [];
  currentMonth: string = '';
  isLoading: boolean = true;

  constructor(private productoTempService: ProductoTempService) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Obtener nombre del mes en inglés para la consulta
    const date = new Date();
    const mesEn = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    this.currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
    this.currentMonth = this.currentMonth.charAt(0).toUpperCase() + this.currentMonth.slice(1);

    this.productoTempService.getProductosDelMes().subscribe(response => {
      this.products = response.productos;

      // Para cada producto, buscar subproductos
      this.products.forEach(producto => {
        this.productoTempService.getDetallesPorIdTemp(producto.idTemp).subscribe(detalles => {
          // Se le añade un nuevo campo dinámicamente
          (producto as any).detalles = detalles;
        });
      });

      this.isLoading = false;
    }, error => {
      console.error("Error al cargar productos del mes:", error);
      this.isLoading = false;
    });
  }
}