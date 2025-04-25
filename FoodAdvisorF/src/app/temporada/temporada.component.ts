import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Asegúrate de importar el Router
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

  constructor(
    private productoTempService: ProductoTempService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    const date = new Date();
    const mesEn = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    this.currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
    this.currentMonth = this.currentMonth.charAt(0).toUpperCase() + this.currentMonth.slice(1);

    this.productoTempService.getProductosDelMes().subscribe(response => {
      this.products = response.productos;
      this.products.forEach(producto => {
        this.productoTempService.getDetallesPorIdTemp(producto.idTemp).subscribe(detalles => {
          (producto as any).detalles = detalles;
        });
      });
      this.isLoading = false;
    }, error => {
      console.error("Error al cargar productos del mes:", error);
      this.isLoading = false;
    });
  }

  // Método para navegar al detalle del producto
  goToProductDetail(id: number) {
    console.log('Navegando a producto con ID:', id);
    this.router.navigate(['/producto-detalle', id]);
  }
}