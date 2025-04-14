import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../security/models/product';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { ProductService } from '../services/product/product.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  isMenuOpen = false; // Esta variable indica si el menú está desplegado o no

  supermercadoOptions = [
    { label: 'Supermercado 1', value: 'supermercado1' },
    { label: 'Supermercado 2', value: 'supermercado2' },
    { label: 'Supermercado 3', value: 'supermercado3' }
  ];
  subcategoriaOptions = [
    { label: 'sub 1', value: 'sub1' },
    { label: 'sub 2', value: 'sub2' },
    { label: 'sub 3', value: 'sub3' }
  ];
  subcategoria2Options = [
    { label: 'sub 1', value: 'sub1' },
    { label: 'sub 2', value: 'sub2' },
    { label: 'sub 3', value: 'sub3' }
  ];
  temporadaOptions = [
    { label: 'temp 1', value: 'temp1' },
    { label: 'temp 2', value: 'temp2' },
    { label: 'temp 3', value: 'temp3' }
  ];
  categoriaOptions = [
    { label: 'Categoría 1', value: 'categoria1' },
    { label: 'Categoría 2', value: 'categoria2' },
    { label: 'Categoría 3', value: 'categoria3' }
  ];

  nivelPiramideOptions = [
    { label: 'Pira 1', value: 'pira1' },
    { label: 'Pira 2', value: 'pira2' },
    { label: 'Pira 3', value: 'pira3' }
  ];

  supermercadoOptions2 = [
    { label: 'Supermercado 4', value: 'supermercado4' },
    { label: 'Supermercado 5', value: 'supermercado5' },
    { label: 'Supermercado 6', value: 'supermercado6' }
  ];
  regionOptions2 = [
    { label: 'Región 4', value: 'region4' },
    { label: 'Región 5', value: 'region5' },
    { label: 'Región 6', value: 'region6' }
  ];
  categoriaOptions2 = [
    { label: 'Categoría 4', value: 'categoria4' },
    { label: 'Categoría 5', value: 'categoria5' },
    { label: 'Categoría 6', value: 'categoria6' }
  ];

  // Variables para almacenar las opciones seleccionadas
  // Variables para almacenar las opciones seleccionadas
  selectedSupermercado: string = 'ninguno';
  selectedCategoria: string = 'ninguno';
  selectedSupermercado2: string = 'ninguno';
  selectedRegion2: string = 'ninguno';
  selectedCategoria2: string = 'ninguno';
  selectedSubcategoria: string = 'ninguno';
  selectedSubcategoria2: string = 'ninguno';
  selectedTemporada: string = 'ninguno';
  selectedNivelPiramide:  string = 'ninguno';


  precio = { start: 0.0, end: 100.0 };
  grasa = { start: 0.0, end: 100.0 };
  azucar = { start: 0.0, end: 100.0 };
  sal = { start: 0.0, end: 100.0 };
  proteinas = { start: 0.0, end: 100.0 };
  hidrato= { start: 0.0, end: 100.0 };
  acidos= { start: 0.0, end: 100.0 };


  products: Product[] = [];
  currentPage = 1;
  totalPages =487;

  maxVisiblePages = 5;
  visiblePages: number[] = [];


  constructor(private communicationService: CommunicationService, private productService: ProductService, private router: Router) {
  }

  ngOnInit() {
    let loggedIn: boolean = false;
    if (localStorage.getItem('token')) {
      loggedIn = true;
    }

    this.communicationService.showHeaderChange({ showHeader: true , logged: loggedIn });

    this.productService.getAllProducts(this.currentPage).subscribe((response:any)=> {
      this.products = response.data;
    });
    this.updateVisiblePages();

  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Función para redirigir al detalle del producto
  goToProductDetail(productId: number) {
    console.log('Navegando a producto con ID:', productId);
    this.router.navigate(['/producto-detalle', productId]);
  }

  keepLastTwoWordsTogether(text: string) {
    return text.replace(/\s(?=\S+$)/, '\u00A0');
  }


  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedProducts();
    }
  }

  updatePagedProducts() {
    this.productService.getAllProducts(this.currentPage).subscribe((response:any)=> {
      this.products = response.data;
      console.log('Productos cargados:', this.products);

    });
    this.updateVisiblePages();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  initPage() {
    if (this.currentPage > 1) {
      this.changePage(1);
    }
  }

  lastPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.totalPages);
    }
  }

  updateVisiblePages() {
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
