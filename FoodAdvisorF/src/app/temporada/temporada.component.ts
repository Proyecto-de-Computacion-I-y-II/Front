import { Component, OnInit } from '@angular/core';
import { ProductoTemporada } from '../models/producto-temp';
import { ProductoTempService } from '../services/producto-temp.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temporada',
  standalone: false,
  templateUrl: './temporada.component.html',
  styleUrls: ['./temporada.component.css']
})
export class TemporadaComponent implements OnInit {

  products: ProductoTemporada[] = [];
  currentMonth: string = '';
  meses = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  

  constructor(private productoTempService: ProductoTempService) {}

  ngOnInit(): void {
    const monthIndex = new Date().getMonth(); // Obtiene el mes actual (0 - 11)
    this.currentMonth = this.meses[monthIndex]; // Asigna el nombre del mes actual
    this.productoTempService.getProductosDelMes().subscribe(response => {
      // Suponiendo que tu endpoint devuelve { mes: "April", productos: [...] }
      this.products = response.productos;
      console.log("Productos del mes:", this.products);
    }, error => {
      console.error("Error al cargar productos del mes:", error);
    });
  }
}