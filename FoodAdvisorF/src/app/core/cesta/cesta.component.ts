import { Component } from '@angular/core';
import { CestaService } from '../services/cesta/cesta.service';

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
}
