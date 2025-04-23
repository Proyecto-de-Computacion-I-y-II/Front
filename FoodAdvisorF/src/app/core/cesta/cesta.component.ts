<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CestaService } from '../services/cesta/cesta.service';
import { ProductService } from '../services/product/product.service';
import { Chart, ChartOptions, ChartType, ChartData } from 'chart.js/auto';
import { MatSnackBar } from '@angular/material/snack-bar';
=======
import { Component, OnInit } from '@angular/core';
import { CestaService } from '../services/cesta/cesta.service';
import { ProductService } from '../services/product/product.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
>>>>>>> Stashed changes
=======
import { Component, OnInit } from '@angular/core';
import { CestaService } from '../services/cesta/cesta.service';
import { ProductService } from '../services/product/product.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
>>>>>>> Stashed changes

@Component({
  selector: 'app-cesta',
  standalone: false,
  templateUrl: './cesta.component.html',
  styleUrl: './cesta.component.css'
})
<<<<<<< Updated upstream
<<<<<<< Updated upstream
export class CestaComponent implements OnInit, AfterViewInit {
  productosEnCesta: any[] = [];
  idCestaUsuario: number = 1; // *** ¡REEMPLAZA ESTO CON TU LÓGICA PARA OBTENER EL ID DE LA CESTA! ***
  porcentajesCesta: any[] = []; // Para almacenar los datos de los porcentajes
  @ViewChild('porcentajeChart') porcentajeChartCanvas!: ElementRef;
  chart: Chart | null = null;
  productosRecomendados: any[] = [];

  constructor(
    private cestaService: CestaService,
    private snackBar: MatSnackBar // <- Asegúrate de tener esta línea
  ) { }
  ngOnInit(): void {
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
        if (data && data.cesta && data.cesta.length > 0 && data.cesta[0].productos) {
          this.productosEnCesta = data.cesta[0].productos;
          
        } else {
          this.productosEnCesta = [];
          
        }
      },
      error: (error) => {
        console.error('Error al obtener la cesta desde la API:', error);
      }
    });
  }

  obtenerPorcentajesDeLaCesta() {
    this.cestaService.obtenerPorcentajesCesta(this.idCestaUsuario).subscribe({
      next: (data) => {
        this.porcentajesCesta = data;
        this.renderizarGrafico(); // Renderiza el gráfico cuando se obtienen los datos
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
      'rgba(255, 99, 132, 0.7)',    // Rojo
      'rgba(54, 162, 235, 0.7)',   // Azul
      'rgba(255, 206, 86, 0.7)',   // Amarillo
      'rgba(75, 192, 192, 0.7)',   // Verde azulado
      'rgba(153, 102, 255, 0.7)',  // Morado
      'rgba(255, 159, 64, 0.7)',   // Naranja
      'rgba(144, 238, 144, 0.7)'   // Verde claro
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
      this.chart.destroy(); // Destruye el gráfico existente si hay uno
    }

    this.chart = new Chart(
      this.porcentajeChartCanvas.nativeElement,
      {
        type: 'pie',
        data: chartData,
        options: chartOptions
      }
    );
=======
export class CestaComponent implements OnInit {
  productosEnCesta: any[] = [];
  showDeleteConfirmation: boolean = false;
  showProfile: boolean = false; // Controla si mostrar el botón de borrar cesta
  private apiUrl = environment.apiUrl;
  private cestaId: number = 0;
  
  constructor(
    private cestaService: CestaService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  
  ngOnInit(): void {
    // Obtener el ID de la cesta de los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cestaId = +params['id'];
      }
    });
    
    this.productosEnCesta = this.cestaService.obtenerProductosEnCarrito();
    // Determina si el usuario está autenticado para mostrar el botón
    this.showProfile = !!localStorage.getItem('token');
>>>>>>> Stashed changes
  }
=======
export class CestaComponent implements OnInit {
  productosEnCesta: any[] = [];
  showDeleteConfirmation: boolean = false;
  showProfile: boolean = false; // Controla si mostrar el botón de borrar cesta
  private apiUrl = environment.apiUrl;
  private cestaId: number = 0;
  
  constructor(
    private cestaService: CestaService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  
  ngOnInit(): void {
    // Obtener el ID de la cesta de los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cestaId = +params['id'];
      }
    });
    
    this.productosEnCesta = this.cestaService.obtenerProductosEnCarrito();
    // Determina si el usuario está autenticado para mostrar el botón
    this.showProfile = !!localStorage.getItem('token');
  }
>>>>>>> Stashed changes
  
  getSupermercadoNombre(idSuper: number | undefined): string {
    return ProductService.getSupermercadoNombre(idSuper ?? 0);
  }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

  decrementarCantidad(producto: any) {
    if (producto.pivot.cantidad > 1) {
      producto.pivot.cantidad--;
      this.actualizarCestaEnApi(producto, producto.pivot.cantidad); // Pasamos el producto completo
    }
  }

  incrementarCantidad(producto: any) {
    producto.pivot.cantidad++;
    this.actualizarCestaEnApi(producto, producto.pivot.cantidad); // Pasamos el producto completo
  }

  actualizarCestaEnApi(producto: any, cantidad: number) {
    this.cestaService.agregarProductoAlCarrito(producto, cantidad); // Ahora recibe el producto completo
    this.snackBar.open("Cantidad actualizada", "Entendido", { duration: 2000 });
    this.obtenerProductosDeLaCestaDesdeApi();
    this.obtenerPorcentajesDeLaCesta();
  }

  obtenerProductosRecomendados() {
    this.cestaService.obtenerRecomendacionesCesta(this.idCestaUsuario).subscribe({
      next: (data) => {
        this.productosRecomendados = []; // Reinicia el array

        // Verifica si la propiedad 'recomendaciones' existe en la respuesta
        if (data && data.recomendaciones) {
          // Itera sobre las claves del objeto 'recomendaciones' (que son los idNivel)
          for (const nivelId in data.recomendaciones) {
            if (data.recomendaciones.hasOwnProperty(nivelId)) {
              // Concatena el array de productos para cada nivel al array principal
              this.productosRecomendados = this.productosRecomendados.concat(data.recomendaciones[nivelId]);
            }
          }
        }

        console.log('Productos recomendados procesados:', this.productosRecomendados);
      },
      error: (error) => {
        console.error('Error al obtener las recomendaciones de la cesta:', error);
      }
    });
  }

  agregarProductoRecomendado(producto: any) {
    const cestaId = this.idCestaUsuario; // Asegúrate de tener el ID de la cesta disponible

    // Aquí llamas a tu servicio para agregar el producto recomendado a la cesta
    this.cestaService.agregarProductoRecomendado(producto, 1) // Pasamos el ID de la cesta, el producto y la cantidad
      .subscribe({
        next: (response) => {
          this.snackBar.open(`${producto.nombre} añadido a la cesta`, 'Entendido', { duration: 2000 });
          this.obtenerProductosDeLaCestaDesdeApi(); // Recarga la cesta
          this.obtenerPorcentajesDeLaCesta(); // Recarga los porcentajes
          this.obtenerProductosRecomendados(); // Recarga las recomendaciones
        },
        error: (error) => {
          this.snackBar.open(`No se pudo añadir ${producto.nombre} a la cesta`, 'Entendido', { duration: 3000 });
          console.error('Error al añadir producto recomendado a la cesta:', error);
        }
      });
=======
=======
>>>>>>> Stashed changes
  
  // Métodos para el diálogo de confirmación
  confirmDeleteCart(): void {
    this.showDeleteConfirmation = true;
  }
  
  cancelDeleteCart(): void {
    this.showDeleteConfirmation = false;
  }
  
  acceptDeleteCart(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // Si no tenemos el ID de la cesta de la ruta, intentamos obtenerlo del servicio
      if (!this.cestaId) {
        this.cestaId = this.obtenerIdCestaActual();
      }
      
      if (!this.cestaId) {
        alert('No se pudo identificar la cesta para eliminar. Por favor, inténtalo de nuevo.');
        this.showDeleteConfirmation = false;
        return;
      }
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      // Utilizamos el endpoint correcto según la API
      this.http.delete(`${this.apiUrl}/cestas-compra/${this.cestaId}`, { headers }).subscribe({
        next: (response: any) => {
          console.log('Cesta eliminada correctamente:', response.mensaje);
          
          // Limpiamos la cesta localmente
          this.vaciarCarritoLocal();
          
          // Cerramos el diálogo de confirmación
          this.showDeleteConfirmation = false;
          
          // Redirigimos a la página de cestas
          this.router.navigate(['/cestas']);
        },
        error: (error) => {
          console.error('Error al eliminar la cesta:', error);
          
          // Mostramos un mensaje de error al usuario
          let errorMsg = 'Ha ocurrido un error al intentar eliminar la cesta.';
          if (error.error && error.error.mensaje) {
            errorMsg = error.error.mensaje;
          }
          
          alert(errorMsg + ' Por favor, inténtalo de nuevo.');
          this.showDeleteConfirmation = false;
        }
      });
    } else {
      // Si no hay token, redirige al login
      this.router.navigate(['/login']);
    }
  }
  
  // Método para obtener el ID de la cesta actual
  private obtenerIdCestaActual(): number {
    // Intentamos obtener el ID de la cesta del localStorage
    const cestaInfo = localStorage.getItem('cestaInfo');
    if (cestaInfo) {
      try {
        const cesta = JSON.parse(cestaInfo);
        return cesta.ID_cesta;
      } catch (error) {
        console.error('Error al parsear la información de la cesta:', error);
      }
    }
    
    // Si no hay información en localStorage, intentamos obtenerla del primer producto
    if (this.productosEnCesta && this.productosEnCesta.length > 0 && this.productosEnCesta[0].idCesta) {
      return this.productosEnCesta[0].idCesta;
    }
    
    // Si no podemos obtener el ID de ninguna manera, devolvemos 0 o manejamos el error
    console.warn('No se pudo obtener el ID de la cesta actual');
    return 0;
  }
  
  // Método para vaciar el carrito localmente
  private vaciarCarritoLocal(): void {
    // Limpiamos el array de productos
    this.productosEnCesta = [];
    
    // Limpiamos el localStorage
    localStorage.removeItem('productosEnCarrito');
    localStorage.removeItem('cestaInfo');
    
  }
  
  closeConfirmationOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('confirmation-overlay')) {
      this.showDeleteConfirmation = false;
    }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
}

