import { Component, OnInit } from '@angular/core';
import { ProductoTemporada } from '../models/producto-temp';
import { ActivatedRoute } from '@angular/router';
import { ProductoTempService } from '../services/producto-temp.service';
import { Router } from '@angular/router';
import { ProductService } from '../core/services/product/product.service';

@Component({
  selector: 'app-subproductos-temporada',
  standalone: false,
  templateUrl: './subproductos-temporada.component.html',
  styleUrl: './subproductos-temporada.component.css'
})
export class SubproductosTemporadaComponent implements OnInit{

  detalles: any[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private productoTempService: ProductoTempService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idTemp = Number(this.route.snapshot.paramMap.get('idTemp'));
    if (idTemp) {
      this.productoTempService.getDetallesPorIdTemp(idTemp).subscribe(detalles => {
        console.log('Detalles recibidos:', detalles);
        this.detalles = detalles;
        this.isLoading = false;
      }, error => {
        console.error("Error al cargar subproductos:", error);
        this.isLoading = false;
      });
    }
  }

  goToProductDetail(productId: number) {
    console.log('Navegando a producto con ID:', productId);
    this.router.navigate(['/producto-detalle', productId]);
  }
}