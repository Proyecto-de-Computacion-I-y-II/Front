// admin.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  cestas: any[] = [];
  usuarios: { [id: number]: string } = {};
  usuariosUnicos: number[] = [];
  currentUserId: number | null = null;

  usuarioSeleccionado: number | null = null;
  cestaSeleccionada: any = null;
  productosCesta: any[] = [];
  porcentajesCesta: any[] = [];

  isLoadingUsuarios: boolean = false;
  isLoadingCestas: boolean = false;
  isLoadingProductos: boolean = false;

  fechasAgrupadas: { [fecha: string]: any[] } = {};
  productosPorCesta: { [idCesta: number]: any[] } = {};
  fechasVisibles: string[] = [];

  totalUsuarios: number = 0;
  totalCestasPorUsuario: { [id: number]: number } = {};
  totalCestasPorDia: { [fecha: string]: number } = {};
  totalProductosPorCesta: { [idCesta: number]: number } = {};
  totalProductosPorFecha: { [fecha: string]: number } = {};
  productosCargadosPorCesta: { [idCesta: number]: boolean } = {};
  productosCargadosPorFecha: { [fecha: string]: boolean } = {};

  @ViewChild('porcentajeChart') porcentajeChartCanvas!: ElementRef;
  chart: Chart | null = null;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isLoadingUsuarios = true;
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get('http://127.0.0.1:8000/api/usuario', { headers }).subscribe({
      next: (user: any) => {
        this.currentUserId = user.usuario.ID_user;
        this.loadCestas();
      },
      error: err => {
        console.error('Error obteniendo usuario actual:', err);
        this.isLoadingUsuarios = false;
      }
    });
  }

  loadCestas() {
    this.isLoadingUsuarios = true;
    this.http.get<any[]>('http://127.0.0.1:8000/api/cestas-compra').subscribe({
      next: (cestasData) => {
        const filtradas = cestasData.filter(c => c.ID_user !== this.currentUserId);
        this.cestas = filtradas;

        const uniqueUserIds = [...new Set(filtradas.map(c => c.ID_user))];
        this.usuariosUnicos = uniqueUserIds;
        this.totalUsuarios = uniqueUserIds.length;

        if (uniqueUserIds.length === 0) this.isLoadingUsuarios = false;

        let cargados = 0;
        uniqueUserIds.forEach(id => {
          this.http.get<any>(`http://127.0.0.1:8000/api/usuario/login/${id}`).subscribe({
            next: (userData) => {
              this.usuarios[id] = `${userData.nombre} ${userData.apellidos}`;
              if (++cargados === uniqueUserIds.length) {
                this.isLoadingUsuarios = false;
                uniqueUserIds.forEach(uid => this.obtenerCestasDeUsuario(uid, true));
              }
            },
            error: () => {
              this.usuarios[id] = 'Usuario desconocido';
              if (++cargados === uniqueUserIds.length) {
                this.isLoadingUsuarios = false;
                uniqueUserIds.forEach(uid => this.obtenerCestasDeUsuario(uid, true));
              }
            }
          });
        });
      },
      error: err => {
        console.error('Error cargando cestas:', err);
        this.isLoadingUsuarios = false;
      }
    });
  }

  obtenerNombreUsuario(id: number): string {
    return this.usuarios[id] || 'Cargando...';
  }

  seleccionarUsuario(id: number) {
    this.usuarioSeleccionado = id;
    this.cestaSeleccionada = null;
    this.productosCesta = [];
    this.porcentajesCesta = [];
    this.fechasVisibles = [];

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.obtenerCestasDeUsuario(id);
  }

  obtenerCestasDeUsuario(id: number, preload: boolean = false): void {
    const cestasUsuario = this.cestas
      .filter(c => c.ID_user === id)
      .sort((a, b) => new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime());

    this.totalCestasPorUsuario[id] = cestasUsuario.length;

    if (!preload) {
      this.totalCestasPorDia = {};
      this.totalProductosPorCesta = {};
      this.totalProductosPorFecha = {};
      this.fechasAgrupadas = {};
      this.productosCargadosPorFecha = {};
    }

    const fechaPendientes = new Set<string>();

    for (const cesta of cestasUsuario) {
      const fecha = new Date(cesta.fecha_compra).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      if (!this.fechasAgrupadas[fecha]) {
        this.fechasAgrupadas[fecha] = [];
        this.totalCestasPorDia[fecha] = 0;
        this.totalProductosPorFecha[fecha] = 0;
        this.productosCargadosPorFecha[fecha] = false;
        fechaPendientes.add(fecha);
      }

      this.fechasAgrupadas[fecha].push(cesta);
      this.totalCestasPorDia[fecha]++;

      this.productosCargadosPorCesta[cesta.ID_cesta] = false;

      this.http.get<any>(`http://127.0.0.1:8000/api/admin/cesta/${cesta.ID_cesta}`).subscribe({
        next: (data) => {
          const productos = data?.cesta?.productos || [];
          this.productosPorCesta[cesta.ID_cesta] = productos;
          this.totalProductosPorCesta[cesta.ID_cesta] = productos.length;
          this.totalProductosPorFecha[fecha] += productos.length;
          this.productosCargadosPorCesta[cesta.ID_cesta] = true;

          // Check if all cestas of the date are loaded
          const allLoaded = this.fechasAgrupadas[fecha].every(
            c => this.productosCargadosPorCesta[c.ID_cesta]
          );
          if (allLoaded) this.productosCargadosPorFecha[fecha] = true;
        },
        error: () => {
          this.productosPorCesta[cesta.ID_cesta] = [];
          this.totalProductosPorCesta[cesta.ID_cesta] = 0;
          this.productosCargadosPorCesta[cesta.ID_cesta] = true;

          const allLoaded = this.fechasAgrupadas[fecha].every(
            c => this.productosCargadosPorCesta[c.ID_cesta]
          );
          if (allLoaded) this.productosCargadosPorFecha[fecha] = true;
        }
      });
    }
  }

  getFechas(): string[] {
    return Object.keys(this.fechasAgrupadas);
  }

  toggleFechaExpandida(fecha: string): void {
    const index = this.fechasVisibles.indexOf(fecha);
    if (index > -1) {
      this.fechasVisibles.splice(index, 1);
    } else {
      this.fechasVisibles.push(fecha);
    }
  }

  seleccionarCesta(cesta: any) {
    this.cestaSeleccionada = cesta;
    this.productosCesta = this.productosPorCesta[cesta.ID_cesta] || [];
    this.porcentajesCesta = [];
    this.obtenerPorcentajesDeCesta(cesta.ID_cesta);
  }

  obtenerPorcentajesDeCesta(idCesta: number) {
    this.isLoadingCestas = true;
    this.http.get<any[]>(`http://127.0.0.1:8000/api/cestas/${idCesta}/porcentajes`).subscribe({
      next: (data) => {
        this.porcentajesCesta = data;
        this.isLoadingCestas = false;
        setTimeout(() => {
          this.cdRef.detectChanges();
          this.renderizarGrafico();
        }, 0);
      },
      error: err => {
        console.error('Error obteniendo porcentajes:', err);
        this.isLoadingCestas = false;
      }
    });
  }

  renderizarGrafico() {
    if (!this.porcentajeChartCanvas || !this.porcentajeChartCanvas.nativeElement) return;
    if (this.porcentajesCesta.length === 0) return;

    const labels = this.porcentajesCesta.map(p => p.nivel_piramide.Nombre);
    const dataValues = this.porcentajesCesta.map(p => parseFloat(p.porcentaje));

    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ];
    const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));

    const chartData: ChartData<'pie'> = {
      labels,
      datasets: [{
        label: 'Porcentaje por Nivel',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    const chartOptions: ChartOptions<'pie'> = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: `Distribución nutricional de la cesta ${this.cestaSeleccionada?.ID_cesta}`
        }
      }
    };

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.porcentajeChartCanvas.nativeElement, {
      type: 'pie',
      data: chartData,
      options: chartOptions
    });
  }
}