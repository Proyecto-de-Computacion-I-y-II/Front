import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
  fibra = { start: 0.00, end: 0.00, max: 100.00 };



  selectedCategoria: number | '' = '';
  selectedSubcategoria: number | '' = '';
  selectedSubcategoria2: number | '' = '';

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategorias2: Subcategoria2[] = [];

  nombre: string = '';
  titulo: string = 'Productos';

  selectedSupermercados: number[] = [];
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
    console.log('Aplicando filtros...');

    const filtros: any = {};

    // Filtro por supermercado
    if (this.selectedSupermercados.length > 0) {
      filtros.idSuper = this.selectedSupermercados;
    }

    // Filtro por categoría
    if (this.selectedCategoria !== '') {
      filtros.id_cat = this.selectedCategoria;
    }

    // Filtro por subcategorías
    if (this.selectedSubcategoria !== '') {
      filtros.id_sub_cat =  this.selectedSubcategoria;
    }

    if (this.selectedSubcategoria2 !== '') {
      filtros.id_sub_cat_2 = this.selectedSubcategoria2;
    }

    // Filtro de precio
    if (this.precio.start !== 0.00 || this.precio.end !== this.precio.max) {
      filtros.precio_min = this.precio.start;
      filtros.precio_max = this.precio.end;
    }

    // Filtros nutricionales
    if (this.grasa.start !== 0.00) filtros.grasas_min = this.grasa.start;
    if (this.grasa.end !== this.grasa.max) filtros.grasas_max = this.grasa.end;

    if (this.azucar.start !== 0.00) filtros.azucares_min = this.azucar.start;
    if (this.azucar.end !== this.azucar.max) filtros.azucares_max = this.azucar.end;

    if (this.sal.start !== 0.00) filtros.sal_min = this.sal.start;
    if (this.sal.end !== this.sal.max) filtros.sal_max = this.sal.end;

    if (this.proteinas.start !== 0.00) filtros.proteinas_min = this.proteinas.start;
    if (this.proteinas.end !== this.proteinas.max) filtros.proteinas_max = this.proteinas.end;

    if (this.hidrato.start !== 0.00) filtros.hidratos_carbono_min = this.hidrato.start;
    if (this.hidrato.end !== this.hidrato.max) filtros.hidratos_carbono_max = this.hidrato.end;

    if (this.acidos.start !== 0.00) filtros.acidos_grasos_min = this.acidos.start;
    if (this.acidos.end !== this.acidos.max) filtros.acidos_grasos_max = this.acidos.end;

    if (this.fibra.start !== 0.00) filtros.fibra_min = this.fibra.start;
    if (this.fibra.end !== this.fibra.max) filtros.fibra_max = this.fibra.end;


    if (this.nombre !='') {
      filtros.nombre = this.nombre;
    }

    console.log('Filtros enviados:', filtros);

    this.isLoading = true;

    this.productService.filtrarProductos(filtros, this.currentPage).subscribe(
      (response: any) => {
        this.products = response.productos;
        this.totalPages = response.total_paginas || 1;
        this.currentPage = response.pagina_actual || 1;
        this.updateVisiblePages();
        this.isLoading = false;
        this.sidebarOpen = false;
        console.log(this.products);
      },
      (error) => {
        console.error('Error al aplicar filtros', error);
        this.isLoading = false;
      }
    );
  }





  onSupermercadoChange() {
    this.selectedCategoria = '';
    this.selectedSubcategoria = '';
    this.selectedSubcategoria2 = '';
    this.categorias = [];
    this.subcategorias = [];
    this.subcategorias2 = [];

    if (this.selectedSupermercados.length == 1) {
      this.supermarketService.getCategoriasArbol(+this.selectedSupermercados[0]).subscribe(
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
  totalPages = 1;

  maxVisiblePages = 5;
  visiblePages: number[] = [];

  isLoading: boolean = true;

  constructor(private communicationService: CommunicationService,
              private productService: ProductService,
              private supermarketService: SupermarketService,
              private router: Router,
              private route: ActivatedRoute) {
  }



  ngOnInit() {




    let loggedIn: boolean = false;
    if (localStorage.getItem('token')) {
      loggedIn = true;
    }

    this.communicationService.showHeaderChange({ showHeader: true , logged: loggedIn });

    this.isLoading = true;



    var charged_filter = false;

    this.productService.getValoresMaximos().subscribe((valores: any) => {
      this.precio.end = this.getTruncatedEnd(valores.precio);
      this.precio.max = this.precio.end;

      this.grasa.end = this.getTruncatedEnd(valores.grasas);
      this.grasa.max = this.grasa.end;

      this.azucar.end = this.getTruncatedEnd(valores.azucares);
      this.azucar.max = this.azucar.end;

      this.sal.end = this.getTruncatedEnd(valores.sal);
      this.sal.max = this.sal.end;

      this.proteinas.end = this.getTruncatedEnd(valores.proteinas);
      this.proteinas.max = this.proteinas.end;

      this.hidrato.end = this.getTruncatedEnd(valores.hidratos_carbono);
      this.hidrato.max = this.hidrato.end;

      this.acidos.end = this.getTruncatedEnd(valores.acidos_grasos);
      this.acidos.max = this.acidos.end;

      this.fibra.end = this.getTruncatedEnd(valores.fibra);
      this.fibra.max = this.fibra.end;

      charged_filter = true;

      if (charged_filter) {
        this.route.queryParams.subscribe(params => {
          this.nombre = params['search'] || '';
          console.log('Búsqueda en HomeComponent:', this.nombre);
          if(this.nombre != '') {
            this.titulo = "Resultados para ''" + this.nombre + "''";
          }
          this.aplicarFiltros();
        });

      }
    });



    this.selectedSupermercados = this.supermercadoIds;


  }

  getTruncatedEnd(value: any) {
    const num = parseFloat(value) || 0;

    if (num >= 1000) {
      return Math.ceil(num / 100) * 100; // Truncar a la centena
    } else if (num >= 100) {
      return Math.ceil(num / 10) * 10; // Truncar a la decena
    } else {
      return Math.ceil(num / 10) * 10; // Truncar a la unidad
    }
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

   this.aplicarFiltros();

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



  limpiarFiltros() {
    if(this.nombre != '') {
      this.router.navigate(['/home']);
      this.nombre =  '';
      this.titulo = "Productos";
    }
    this.precio.start = 0.00;
    this.precio.end = Math.trunc(this.precio.max);

    this.grasa.start = 0.00;
    this.grasa.end = Math.trunc(this.grasa.max);

    this.azucar.start = 0.00;
    this.azucar.end = Math.trunc(this.azucar.max);

    this.sal.start = 0.00;
    this.sal.end = Math.trunc(this.sal.max);

    this.proteinas.start = 0.00;
    this.proteinas.end = Math.trunc(this.proteinas.max);

    this.hidrato.start = 0.00;
    this.hidrato.end = Math.trunc(this.hidrato.max);

    this.acidos.start = 0.00;
    this.acidos.end = Math.trunc(this.acidos.max);

    this.fibra.start = 0.00;
    this.fibra.end = Math.trunc(this.fibra.max);

    // Reseteo de supermercados y categorías
    this.selectedSupermercados = this.supermercadoIds; // todos
    this.selectedCategoria = '';
    this.selectedSubcategoria = '';
    this.selectedSubcategoria2 = '';

    this.categorias = [];
    this.subcategorias = [];
    this.subcategorias2 = [];

    this.nombre = '';

    this.isLoading = true;
    this.productService.getAllProducts(1).subscribe((response: any) => {
      this.products = response.productos;
      this.totalPages = response.total_paginas;
      this.currentPage = response.pagina_actual || 1;
      this.updateVisiblePages();
      this.isLoading = false;
    }, (error) => {
      console.error('Error al cargar productos', error);
      this.isLoading = false;
    });
  }




}
