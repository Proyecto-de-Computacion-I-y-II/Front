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
  private apiUrl = environment.apiUrl;
  private cestaId: number = 0;
  isLoading: boolean = true;
  esUltimaCesta: boolean = false;

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
    // No llamamos a renderizarGrafico aquí inicialmente.
  }

  obtenerProductosDeLaCestaDesdeApi() {
    this.isLoading = true; // Iniciamos la carga, mostramos el spinner
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
    if (!this.porcentajeChartCanvas || !this.porcentajesCesta || this.porcentajesCesta.length === 0 /* || this.esUltimaCesta */) {
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
      this.actualizarCestaEnApi(producto, producto.pivot.cantidad);
    }
  }

  incrementarCantidad(producto: any) {
    producto.pivot.cantidad++;
    this.actualizarCestaEnApi(producto, producto.pivot.cantidad);
  }

  actualizarCestaEnApi(producto: any, cantidad: number) {
    this.cestaService.modificarCantidadCarrito(producto.ID_prod, cantidad);
    this.snackBar.open("Cantidad actualizada", "Entendido", { duration: 2000 });
    this.obtenerProductosDeLaCestaDesdeApi();
    this.obtenerPorcentajesDeLaCesta();
  }

  obtenerProductosRecomendados() {
    if (this.esUltimaCesta) {
      this.productosRecomendados = [];
      return;
    }

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
      alert('No se pudo identificar la cesta para eliminar.');
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
        alert(errorMsg);
        this.showDeleteConfirmation = false;
      }
    });
  }

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

  closeConfirmationOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmation = false;
    }
  }

  calcularPrecioTotal(): number {
    let total = 0;
    for (const producto of this.productosEnCesta) {
      total += producto.precio * producto.pivot.cantidad;
    }
    return total;
  }

  estaCompletado(producto: any): boolean {
    return !!producto.completado;
  }

  toggleCompletado(producto: any, event: MatCheckboxChange): void {
    producto.completado = event.checked;
    // Aquí puedes llamar a un servicio para actualizar el estado en el backend si es necesario
    console.log(`Producto ${producto.ID_prod} completado: ${producto.completado}`);
  }
}