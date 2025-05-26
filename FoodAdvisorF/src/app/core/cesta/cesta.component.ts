import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { environment } from '../../../environments/environment';
import { CestaService } from '../services/cesta/cesta.service';
import { ProductService } from '../services/product/product.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-cesta',
  standalone: false,
  templateUrl: './cesta.component.html',
  styleUrl: './cesta.component.css',
})
export class CestaComponent implements OnInit, AfterViewInit {
  productosEnCesta: any[] = [];
  idCestaUsuario: number = 0;
  porcentajesCesta: any[] = [];
  @ViewChild('porcentajeChart') porcentajeChartCanvas!: ElementRef;
  chart: Chart | null = null;
  productosRecomendados: any[] = [];
  showDeleteConfirmation: boolean = false;
  // Nuevas propiedades para la confirmación de eliminación de un solo producto
  showDeleteConfirmationProduct: boolean = false;
  productToDelete: any = null; // Almacena el producto que se va a eliminar

  private apiUrl = environment.apiUrl;
  private cestaId: number = 0;
  isLoading: boolean = true;
  esUltimaCesta: boolean = false;
  private actualizarDatosTimeout: any;
  private actualizarCantidadTimeout: { [productId: number]: any } = {};
  private readonly debounceTime = 500; // Esperar 500ms después del último cambio

  constructor(
    private cestaService: CestaService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cestaId = +params['id'];
      }
    });
    this.idCestaUsuario = Number(this.route.snapshot.paramMap.get('id'));
    this.obtenerProductosDeLaCestaDesdeApi();
    this.obtenerPorcentajesDeLaCesta();
    this.obtenerProductosRecomendados();
  }

  ngAfterViewInit(): void {
    this.renderizarGrafico();
  }

  obtenerProductosDeLaCestaDesdeApi() {
    this.cestaService.obtenerProductosDeCesta(this.idCestaUsuario).subscribe({
      next: (data: any) => {
        if (data && data.cesta && data.cesta.productos && Array.isArray(data.cesta.productos)) {
          this.productosEnCesta = data.cesta.productos;
          this.esUltimaCesta = data.ultima || false;
        } else {
          this.productosEnCesta = [];
          this.esUltimaCesta = false;
        }
        this.isLoading = false; // Finaliza la carga, ocultamos el spinner
      },
      error: (error) => {
        this.isLoading = false; // En caso de error, también ocultamos el spinner
        this.esUltimaCesta = false;
      }
    });
  }

  obtenerPorcentajesDeLaCesta() {
    this.cestaService.obtenerPorcentajesCesta(this.idCestaUsuario).subscribe({
      next: (data) => {
        this.porcentajesCesta = data;
        this.renderizarGrafico(); // Llamamos a renderizarGrafico cuando los datos están listos
      },
      error: (error) => {
        console.error('Error al obtener los porcentajes de la cesta:', error);
      }
    });
  }

  renderizarGrafico() {
    if (!this.porcentajeChartCanvas || !this.porcentajesCesta || this.porcentajesCesta.length === 0) {
      return;
    }

    const labels = this.porcentajesCesta.map(p => p.nivel_piramide.Nombre);
    const dataValues = this.porcentajesCesta.map(p => parseFloat(p.porcentaje));
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(144, 238, 144, 0.7)'
    ];
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(144, 238, 144, 1)'
    ];

    const chartData: ChartData<'pie'> = {
      labels: labels,
      datasets: [{
        label: 'Porcentaje por Nivel',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      }]
    };

    const chartOptions: ChartOptions<'pie'> = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Porcentaje de Alimentos por Nivel'
        }
      }
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(
      this.porcentajeChartCanvas.nativeElement,
      {
        type: 'pie',
        data: chartData,
        options: chartOptions
      }
    );
  }

  getSupermercadoNombre(idSuper: number | undefined): string {
    return ProductService.getSupermercadoNombre(idSuper ?? 0);
  }

  decrementarCantidad(producto: any) {
    if (producto.pivot.cantidad > 1) {
      producto.pivot.cantidad--;
      this.debounceActualizarCantidad(producto);
    }
  }

  incrementarCantidad(producto: any) {
    producto.pivot.cantidad++;
    this.debounceActualizarCantidad(producto);
  }

  private debounceActualizarCantidad(producto: any) {
    const productId = producto.ID_prod;
    if (this.actualizarCantidadTimeout[productId]) {
      clearTimeout(this.actualizarCantidadTimeout[productId]);
    }
    this.actualizarCantidadTimeout[productId] = setTimeout(() => {
      this.actualizarCestaEnApi(producto, producto.pivot.cantidad);
      delete this.actualizarCantidadTimeout[productId]; // Limpiar el timeout después de la ejecución
    }, this.debounceTime);

    // Actualización optimista de la interfaz (esto ocurre inmediatamente)
    this.actualizarInterfazCantidad(producto, producto.pivot.cantidad);
  }

  private actualizarInterfazCantidad(productoLocal: any, cantidad: number) {
    const productoEnCesta = this.productosEnCesta.find(p => p.ID_prod === productoLocal.ID_prod);
    if (productoEnCesta) {
      productoEnCesta.pivot.cantidad = cantidad;
    }
  }

  actualizarCestaEnApi(producto: any, cantidad: number) {
    this.cestaService.modificarCantidadCarrito(producto.ID_prod, cantidad);
    this.debounceActualizarDatos();
  }

  private debounceActualizarDatos() {
    if (this.actualizarDatosTimeout) {
      clearTimeout(this.actualizarDatosTimeout);
    }
    this.actualizarDatosTimeout = setTimeout(() => {
      this.obtenerPorcentajesDeLaCesta();
      this.obtenerProductosRecomendados();
      this.actualizarDatosTimeout = null;
    }, this.debounceTime);
  }

  obtenerProductosRecomendados() {
    this.cestaService.obtenerRecomendacionesCesta(this.idCestaUsuario).subscribe({
      next: (data) => {
        this.productosRecomendados = [];
        if (data && data.recomendaciones) {
          for (const nivelId in data.recomendaciones) {
            if (data.recomendaciones.hasOwnProperty(nivelId)) {
              this.productosRecomendados = this.productosRecomendados.concat(data.recomendaciones[nivelId]);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener las recomendaciones de la cesta:', error);
      }
    });
  }

  agregarProductoRecomendado(producto: any) {
    const cestaId = this.idCestaUsuario;
    this.cestaService.agregarProductoRecomendado(producto, 1)
      .subscribe({
        next: (response) => {
          this.snackBar.open(`${producto.nombre} añadido a la cesta`, 'Entendido', { duration: 2000 });
          this.obtenerProductosDeLaCestaDesdeApi();
          this.obtenerPorcentajesDeLaCesta();
          this.obtenerProductosRecomendados();
        },
        error: (error) => {
          this.snackBar.open(`No se pudo añadir ${producto.nombre} a la cesta`, 'Entendido', { duration: 3000 });
          console.error('Error al añadir producto recomendado a la cesta:', error);
        }
      });
  }

  // --- Funciones para la eliminación de la cesta completa ---
  confirmDeleteCart(): void {
    this.showDeleteConfirmation = true;
  }

  cancelDeleteCart(): void {
    this.showDeleteConfirmation = false;
  }

  acceptDeleteCart(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.cestaId) {
      this.cestaId = this.obtenerIdCestaActual();
    }

    if (!this.cestaId) {
      this.snackBar.open('No se pudo identificar la cesta para eliminar.', 'Cerrar', { duration: 3000 });
      this.showDeleteConfirmation = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.delete(`${this.apiUrl}/cestas-compra/${this.cestaId}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('Cesta eliminada correctamente:', response.mensaje);
        this.vaciarCarritoLocal();
        this.showDeleteConfirmation = false;
        this.router.navigate(['/cestas']);
      },
      error: (error) => {
        console.error('Error al eliminar la cesta:', error);
        const errorMsg = error.error?.mensaje ?? 'Error al eliminar la cesta.';
        this.snackBar.open(errorMsg, 'Cerrar', { duration: 3000 });
        this.showDeleteConfirmation = false;
      }
    });
  }

  // --- Funciones para la eliminación de un producto individual ---
  /**
   * Muestra el diálogo de confirmación para eliminar un producto individual.
   * @param product El objeto producto a eliminar.
   */
  confirmDeleteProduct(product: any): void {
    this.productToDelete = product; // Almacena el producto que se va a eliminar
    this.showDeleteConfirmationProduct = true; // Muestra el diálogo
  }

  /**
   * Cancela la eliminación de un producto individual y oculta el diálogo.
   */
  cancelDeleteProduct(): void {
    this.showDeleteConfirmationProduct = false;
    this.productToDelete = null; // Limpia el producto guardado
  }

  /**
   * Acepta la eliminación de un producto individual y llama al servicio.
   */
  acceptDeleteProduct(): void {
    if (!this.productToDelete) {
      this.snackBar.open('No se seleccionó ningún producto para eliminar.', 'Cerrar', { duration: 3000 });
      this.showDeleteConfirmationProduct = false;
      return;
    }
  
    // Se ha quitado 'this.idCestaUsuario' de la llamada al servicio
    this.cestaService.eliminarProductoDeCesta(this.productToDelete.ID_prod).subscribe({
      next: (response) => {
        this.snackBar.open('Producto eliminado de la cesta correctamente', 'Cerrar', { duration: 2000 });
        // Filtra los productos en la cesta para quitar el que se eliminó, actualizando la UI
        this.productosEnCesta = this.productosEnCesta.filter(p => p.ID_prod !== this.productToDelete!.ID_prod); // Nota el '!' para asegurar que no es null
        this.showDeleteConfirmationProduct = false;
        this.productToDelete = null; // Limpia el producto guardado
  
        // Vuelve a calcular los porcentajes y obtener recomendaciones para actualizar la interfaz
        this.obtenerPorcentajesDeLaCesta();
        this.obtenerProductosRecomendados();
      },
      error: (error) => {
        console.error('Error al eliminar el producto de la cesta:', error);
        this.snackBar.open('Error al eliminar el producto de la cesta', 'Cerrar', { duration: 3000 });
        this.showDeleteConfirmationProduct = false;
      }
    });
  }

  // --- Métodos Auxiliares ---
  private obtenerIdCestaActual(): number {
    const cestaInfo = localStorage.getItem('cestaInfo');
    if (cestaInfo) {
      try {
        const cesta = JSON.parse(cestaInfo);
        return cesta.ID_cesta;
      } catch (error) {
        console.error('Error al parsear la información de la cesta:', error);
      }
    }

    if (this.productosEnCesta.length > 0 && this.productosEnCesta[0].idCesta) {
      return this.productosEnCesta[0].idCesta;
    }

    console.warn('No se pudo obtener el ID de la cesta actual');
    return 0;
  }

  private vaciarCarritoLocal(): void {
    this.productosEnCesta = [];
    localStorage.removeItem('productosEnCarrito');
    localStorage.removeItem('cestaInfo');
  }

  /**
   * Cierra el diálogo de confirmación de eliminación de cesta al hacer clic fuera.
   * @param event El evento del clic.
   */
  closeConfirmationOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmation = false;
    }
  }

  /**
   * Cierra el diálogo de confirmación de eliminación de producto al hacer clic fuera.
   * @param event El evento del clic.
   */
  closeConfirmationOnOutsideClickProduct(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmationProduct = false;
      this.productToDelete = null; // Limpia el producto guardado
    }
  }

  calcularPrecioTotal(): number {
    let total = 0;
    for (const producto of this.productosEnCesta) {
      total += producto.precio * producto.pivot.cantidad;
    }
    return total;
  }

  // Método para comprobar si un producto está marcado como comprado
  estaCompletado(producto: any): boolean {
    return !!producto.pivot.comprado;
  }

  // Método para manejar el cambio en el checkbox
  toggleCompletado(producto: any, event: MatCheckboxChange): void {
    const isChecked = event.checked;

    this.http.post(`${this.apiUrl}/cestas/toggle-producto-comprado`, {
      ID_cesta: this.idCestaUsuario,
      ID_prod: producto.ID_prod,
      comprado: isChecked
    }).subscribe({
      next: (response: any) => {
        // Actualizar el estado localmente
        producto.pivot.comprado = isChecked;

        this.snackBar.open(
          isChecked ? 'Producto marcado como comprado' : 'Producto desmarcado como comprado',
          'Cerrar',
          { duration: 2000 }
        );
      },
      error: (error) => {
        console.error('Error al actualizar estado del producto:', error);
        this.snackBar.open('Error al actualizar el estado del producto', 'Cerrar', {
          duration: 3000
        });

        // Revertir el estado del checkbox en caso de error
        event.source.checked = !isChecked;
      }
    });
  }
}