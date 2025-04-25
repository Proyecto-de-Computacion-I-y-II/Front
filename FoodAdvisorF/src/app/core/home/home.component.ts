import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Categoria } from '../../security/models/categoria';
import { Product } from '../../security/models/product';
import { Subcategoria } from '../../security/models/subcategoria';
import { Subcategoria2 } from '../../security/models/subcategoria2';
import { CommunicationService } from '../../shared/services/communicacion/communication.service';
import { ProductService } from '../services/product/product.service';
import { SupermarketService } from '../services/supermarket/supermarket.service';

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
  totalPages = 487;

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
      this.precio.end = Math.round(parseInt(valores.precio) / 100) * 100;
      this.precio.max =  this.precio.end


      this.grasa.end = Math.round(parseInt(valores.grasas) / 100) * 100;
      this.grasa.max = this.grasa.end

      this.azucar.end = Math.round(parseInt(valores.azucares) / 100) * 100;
      this.azucar.max = this.azucar.end

      this.sal.end = Math.round(parseInt(valores.sal) / 100) * 100;
      this.sal.max = this.sal.end

      this.proteinas.end = Math.round(parseInt(valores.proteinas) / 100) * 100;
      this.proteinas.max = this.proteinas.end

      this.hidrato.end = Math.round(parseInt(valores.hidratos_carbono) / 100) * 100;
      this.hidrato.max =   this.hidrato.end

      this.acidos.end = Math.round(parseInt(valores.acidos_grasos) / 100) * 100;
      this.acidos.max = this.acidos.end
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
