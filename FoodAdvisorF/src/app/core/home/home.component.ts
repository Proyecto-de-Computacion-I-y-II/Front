import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../security/models/product';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { ProductService } from '../services/product/product.service';
import {Categoria} from '../../security/models/categoria';
import {Subcategoria} from '../../security/models/subcategoria';
import {Subcategoria2} from '../../security/models/subcategoria2';
import {SupermarketService} from '../services/supermarket/supermarket.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {


  precio = { start: 0.00, end: 0.00, max: 100.00 };
  grasa = { start: 0.00, end: 0.00, max: 100.00 };
  azucar = { start: 0.00, end: 0.00, max: 100.00 };
  sal = { start: 0.00, end: 0.00, max: 100.00 };
  proteinas = { start: 0.00, end: 0.00, max: 100.00 };
  hidrato = { start: 0.00, end: 0.00, max: 100.00 };
  acidos = { start: 0.00, end: 0.00, max: 100.00 };




  selectedCategoria: number | '' = '';
  selectedSubcategoria: number | '' = '';
  selectedSubcategoria2: number | '' = '';

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategorias2: Subcategoria2[] = [];




  selectedSupermercado: number | '' = '';  // valor del filtro seleccionado
  supermercadoIds: number[] = Object.keys(ProductService.supermercadoDiccionario).map(id => +id);



  mostrarFiltros: boolean = false;


// Método para mostrar nombre del supermercado
  getSupermercadoNombre(id: number): string {
    return ProductService.getSupermercadoNombre(id);
  }



  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  aplicarFiltros() {
    console.log('Filtros aplicados:', {
      supermercado: this.selectedSupermercado,
      categoria: this.selectedCategoria,
      subcategoria: this.selectedSubcategoria,
      subcategoria2: this.selectedSubcategoria2
    });

    this.sidebarOpen = false;
    // Aquí podrías hacer la lógica para llamar a getProductsFiltrados(...)
  }




  onSupermercadoChange() {
    this.selectedCategoria = '';
    this.selectedSubcategoria = '';
    this.selectedSubcategoria2 = '';
    this.categorias = [];
    this.subcategorias = [];
    this.subcategorias2 = [];

    if (this.selectedSupermercado) {
      this.supermarketService.getCategoriasArbol(+this.selectedSupermercado).subscribe(
        (data) => {
          this.categorias = data;
        },
        (error) => console.error('Error cargando categorías', error)
      );
    }
  }

  onCategoriaChange() {
    this.selectedSubcategoria = '';
    this.selectedSubcategoria2 = '';
    this.subcategorias2 = [];

    const categoriaSeleccionada = this.categorias.find(cat => cat.id === +this.selectedCategoria);
    this.subcategorias = categoriaSeleccionada ? categoriaSeleccionada.subcategorias : [];
  }

  onSubcategoriaChange() {
    this.selectedSubcategoria2 = '';

    const subSeleccionada = this.subcategorias.find(sub => sub.id === +this.selectedSubcategoria);
    this.subcategorias2 = subSeleccionada?.subcategorias2 || [];
  }





  products: Product[] = [];
  currentPage = 1;
  totalPages =487;

  maxVisiblePages = 5;
  visiblePages: number[] = [];

  isLoading: boolean = true;

  constructor(private communicationService: CommunicationService,
              private productService: ProductService,
              private supermarketService: SupermarketService,
              private router: Router) {
  }



  ngOnInit() {
    let loggedIn: boolean = false;
    if (localStorage.getItem('token')) {
      loggedIn = true;
    }

    this.communicationService.showHeaderChange({ showHeader: true , logged: loggedIn });

    this.isLoading = true;


    this.productService.getAllProducts(this.currentPage).subscribe((response:any)=> {
      this.products = response.data;
      console.log('Productos cargados:', this.products);
      this.isLoading = false;
    },
      (error) => {
        console.error('Error al cargar productos', error);
        this.isLoading = false;
      });

    this.updateVisiblePages();

    this.productService.getValoresMaximos().subscribe((valores: any) => {
      this.precio.end = parseInt(valores.precio);
      this.precio.max = parseInt(valores.precio);

      this.grasa.end = parseFloat(valores.grasas);
      this.grasa.max = parseFloat(valores.grasas);

      this.azucar.end = parseFloat(valores.azucares);
      this.azucar.max = parseFloat(valores.azucares);

      this.sal.end = parseInt(valores.sal);
      this.sal.max = parseInt(valores.sal);

      this.proteinas.end = parseFloat(valores.proteinas);
      this.proteinas.max = parseFloat(valores.proteinas);

      this.hidrato.end = parseFloat(valores.hidratos_carbono);
      this.hidrato.max = parseFloat(valores.hidratos_carbono);

      this.acidos.end = parseFloat(valores.acidos_grasos);
      this.acidos.max = parseFloat(valores.acidos_grasos);
    });

  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
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
      this.isLoading = true;

      this.currentPage = page;
      this.updatePagedProducts();
    }
  }

  updatePagedProducts() {
    this.isLoading = true;

    this.productService.getAllProducts(this.currentPage).subscribe((response:any)=> {

      this.products = response.data;
      console.log('Productos cargados:', this.products);
      this.isLoading = false;

    },
      (error) => {
        console.error('Error al cargar productos', error);
        this.isLoading = false;
      }

    );
    this.updateVisiblePages();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.isLoading = true;
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.isLoading = true;
      this.changePage(this.currentPage + 1);
    }
  }

  initPage() {
    if (this.currentPage > 1) {
      this.isLoading = true;
      this.changePage(1);
    }
  }

  lastPage() {
    if (this.currentPage < this.totalPages) {
      this.isLoading = true;
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
