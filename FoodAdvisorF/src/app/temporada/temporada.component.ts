import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
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
  productosSaliendo: ProductoTemporada[] = [];
  isLoading: boolean = true;

  meses: { nombre: string, numero: number }[] = [
    { nombre: 'Enero', numero: 1 },
    { nombre: 'Febrero', numero: 2 },
    { nombre: 'Marzo', numero: 3 },
    { nombre: 'Abril', numero: 4 },
    { nombre: 'Mayo', numero: 5 },
    { nombre: 'Junio', numero: 6 },
    { nombre: 'Julio', numero: 7 },
    { nombre: 'Agosto', numero: 8 },
    { nombre: 'Septiembre', numero: 9 },
    { nombre: 'Octubre', numero: 10 },
    { nombre: 'Noviembre', numero: 11 },
    { nombre: 'Diciembre', numero: 12 },
  ];

  mesSeleccionado: number | null = null;

  constructor(
    private productoTempService: ProductoTempService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const mesActual = new Date().getMonth() + 1; // Mes actual (ajustado para que sea 1-12)
    this.mesSeleccionado = mesActual; // Establece mes actual
    this.cargarProductosPorMes(mesActual); // Cargar productos a mes actual
  }

  cargarProductosPorMes(mes: number): void {
    this.mesSeleccionado = mes;
    this.isLoading = true;
  
    this.productoTempService.getProductosPorMes(mes).subscribe(response => {
      this.products = response.productos;
      this.productosSaliendo = response.productossaliendo;
      
      // Asociar imágenes a los productos en temporada
      this.products.forEach(producto => {
        const nombreImagen = producto.producto.toLowerCase(); // usa nombre como "acelga", "apio"
        (producto as any).imagen = `assets/img/${nombreImagen}.png`;
  
        this.productoTempService.getDetallesPorIdTemp(producto.idTemp).subscribe(detalles => {
          (producto as any).detalles = detalles;
        });
      });
  
      // Asociar imágenes a productos saliendo
      this.productosSaliendo.forEach(producto => {
        const nombreImagen = producto.producto.toLowerCase();
        (producto as any).imagen = `assets/img/${nombreImagen}.png`;
      });
  
      this.isLoading = false;
    }, error => {
      console.error("Error al cargar productos del mes:", error);
      this.isLoading = false;
    });
  }  

  // cargarProductosDelMesActual(): void {
  //   this.isLoading = true;
  //   this.productoTempService.getProductosDelMes().subscribe(response => { 
  //     this.products = response.productos;
  //     this.products.forEach(producto => {
  //       this.productoTempService.getDetallesPorIdTemp(producto.idTemp).subscribe(detalles => {
  //         (producto as any).detalles = detalles;
  //       });
  //     });
  //     this.isLoading = false;
  //   }, error => {
  //     console.error("Error al cargar productos del mes actual:", error);
  //     this.isLoading = false;
  //   });
  // }

  verProductos(product: ProductoTemporada) {
    console.log("Producto clicado:", product);
    this.router.navigate(['/subproducto-temporada', product.idTemp]);
  }
  
}