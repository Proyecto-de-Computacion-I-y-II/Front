import { Component } from '@angular/core';
import { CestaService } from '../services/cesta/cesta.service';
import { ProductService } from '../services/product/product.service';
import { Product } from '../../security/models/product';

@Component({
  selector: 'app-cesta',
  standalone: false,
  templateUrl: './cesta.component.html',
  styleUrl: './cesta.component.css'
})
export class CestaComponent {
  productosEnCesta: any[] = [];

  constructor(private cestaService: CestaService) { }

 ngOnInit(): void {
    this.productosEnCesta = this.cestaService.obtenerProductosEnCarrito();  // Obtiene los productos desde el servicio
  }

  getSupermercadoNombre(idSuper: number | undefined): string {
    return ProductService.getSupermercadoNombre(idSuper ?? 0);  // Proporciona un valor predeterminado si es undefined
  }
}
