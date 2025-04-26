import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CestaService } from '../core/services/cesta/cesta.service';
import { ProductService } from '../core/services/product/product.service';
import { Product } from '../security/models/product';

@Component({
  selector: 'app-producto-detalle',
  standalone: false,
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {

  product: Product | null = null;
  @Input() Product: any;
  @Output() agregarProducto = new EventEmitter<any>();
  cantidad: number = 1;
  isLoading: boolean  = true;
  isLoadingSimillars: boolean = true;
  isStoring: boolean = false;
  forceLogoPng: boolean = false;
  products: Product[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cestaService: CestaService,
    private snackBar: MatSnackBar,
    
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');  // Obtiene el ID del producto desde la URL

    
    if (productId) {
      
      this.productService.getProductById(productId).subscribe((product: Product) => {
        this.product = product;  // Guarda los detalles del producto
        this.isLoading = false;
      });

      this.productService.getProductsSimillarTo(productId).subscribe((response:any)=> {
        this.products = Array.isArray(response) ? response : [];
        console.log('Productos cargados:', this.products);
        this.isLoadingSimillars = false;
        if (this.products.length > 0){
          this.products = this.products.map((product) => {
            // Remove spaces from href URL and sanitize the image URL
            product.imagen = product.imagen.replace(/\s+/g, '');  // Remove spaces
            return product;
          });
        }
      },
        (error) => {
          console.error('Error al cargar productos', error);
          this.isLoadingSimillars = false;
          this.forceLogoPng = true;
          this.router.navigate(['/not-found'])
      });
    }

    this.handleBrowserNavigation();
  }

  handleBrowserNavigation() {
    // Listen for BACK/FORWARD navigation
    window.addEventListener('popstate', () => {
      console.log('Back or Forward detected, reloading...');
      window.location.reload();
    });
  
    // Only react to reload if user really reloaded, not during normal load
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  
    if (navigation?.type === 'reload') {
      console.log('Page was manually reloaded (F5 or button)');
      // ✅ Do NOT reload again here, just detect it (no window.location.reload())
    }
  }

  hasNutritionInfo(): boolean {
    const p = this.product;
    return p?.grasas == 0 &&
           p?.azucares == 0 &&
           p?.acidos_grasos == 0 &&
           p?.sal == 0 &&
           p?.hidratos_carbono == 0 &&
           p?.proteinas == 0;
  }

  hasIngredientes(): boolean {
    return this.product?.ingredientes.trim() == '';
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
      if (!this.isStoring){
        if (localStorage.getItem('token')) {
          // Si está logueado, agregar directamente el producto a la cesta
          this.isStoring = true;
          this.cestaService.agregarProductoAlCarrito(this.product, this.cantidad).subscribe({
            next: (resp) => {
              this.isStoring = false;  // Reset loading state
              this.snackBar.open("Producto añadido", "Entendido", { duration: 2000 });
            },
            error: (err) => {
              this.isStoring = false;  // Reset loading state
              this.snackBar.open("No se ha podido añadir el producto a la cesta. Pruebe más tarde", "Entendido", { duration: 2000 });
              console.log(err.message);
            }
          });
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
    }else{
      this.snackBar.open("Espere unos segundos", "Entendido", { duration: 2000 });
    }
  }

  goToProductDetail(productId: number) {
    console.log('Navegando a producto con ID:', productId);
    this.router.navigate(['/producto-detalle', productId]).then(() => {
      window.location.reload();
    });
  }

  keepLastTwoWordsTogether(text: string) {
    return text.replace(/\s(?=\S+$)/, '\u00A0');
  }

  getSupermercadoNombre(idSuper: number | undefined): string {
    if (idSuper !== undefined) {
      return ProductService.getSupermercadoNombre(idSuper);  // Si idSuper no es undefined, se llama al método
    } else {
      return '---';  // O cualquier valor predeterminado que quieras mostrar
    }
  }
}