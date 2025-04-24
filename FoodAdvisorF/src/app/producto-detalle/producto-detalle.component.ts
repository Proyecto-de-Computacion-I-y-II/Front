import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CestaService } from '../core/services/cesta/cesta.service';
import { ProductService } from '../core/services/product/product.service';
import { Product } from '../security/models/product';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {

  product: Product | null = null;
  private apiUrl = environment.apiUrl + '/productos/';
  @Input() Product: any;
  @Output() agregarProducto = new EventEmitter<any>();
  cantidad: number = 1;
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cestaService: CestaService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');  // Obtiene el ID del producto desde la URL

    if (productId) {
      this.productService.getProductById(productId).subscribe((product: Product) => {
        this.product = product;  // Guarda los detalles del producto
      });
    }
  }

  sumarCantidad() {
    this.cantidad++;
  }

  restarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito() {
    // if (this.product) {
    //   this.cestaService.agregarProductoAlCarrito(this.product, this.cantidad);  // Usa el servicio
    //   //this.router.navigate(['/cestas']);  // Redirige a la página de cesta
    // }
    if (localStorage.getItem('token')) {
      // Si está logueado, agregar directamente el producto a la cesta
      this.cestaService.agregarProductoAlCarrito(this.product, this.cantidad); 
    } else {
      // Si no está logueado, guardar el producto y redirigir al login
      const productoGuardado = {
        producto: this.product,
        cantidad: this.cantidad
      };
      localStorage.setItem('productoPendiente', JSON.stringify(productoGuardado));  // Guardar el producto pendiente en localStorage
      this.router.navigate(['/login']);
    }
  }

  getSupermercadoNombre(idSuper: number | undefined): string {
    if (idSuper !== undefined) {
      return ProductService.getSupermercadoNombre(idSuper);  // Si idSuper no es undefined, se llama al método
    } else {
      return 'Desconocido';  // O cualquier valor predeterminado que quieras mostrar
    }
  }  
}