import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../core/services/product/product.service';
import { Product } from '../security/models/product';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router'; 
import { CestaService } from '../core/services/cesta/cesta.service';

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
    if (this.product) {
      this.cestaService.agregarProductoAlCarrito(this.product, this.cantidad);  // Usa el servicio
      this.router.navigate(['/cesta']);  // Redirige a la página de cesta
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