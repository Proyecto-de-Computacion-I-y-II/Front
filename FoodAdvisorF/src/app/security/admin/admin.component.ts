// admin.component.ts
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // — Estado de carga —
  isLoadingUsuarios = false;
  isLoadingNombreUsuario: { [id: number]: boolean } = {};
  cestasCargando: { [id: number]: boolean } = {};
  productosCargadosPorFecha: { [fecha: string]: boolean } = {};
  productosCargadosPorCesta: { [id: number]: boolean } = {};
  isLoadingCestas = false;
  isLoadingProductos = false;

  // — Datos de usuario —
  currentUserId: number | null = null;
  usuariosUnicos: number[] = [];
  usuarios: { [id: number]: string } = {};
  totalUsuarios = 0;

  // — Datos de cestas —
  cestas: any[] = [];
  totalCestasPorUsuario: { [id: number]: number } = {};
  fechasAgrupadas: { [fecha: string]: any[] } = {};
  totalCestasPorDia: { [fecha: string]: number } = {};
  totalProductosPorFecha: { [fecha: string]: number } = {};
  productosPorCesta: { [id: number]: any[] } = {};
  totalProductosPorCesta: { [id: number]: number } = {};

  // — Selecciones de UI —
  usuarioSeleccionado: number | null = null;
  cestaSeleccionada: any = null;
  fechaAbierta: string | null = null;

  // — Productos y gráfico —
  productosCesta: any[] = [];
  porcentajesCesta: any[] = [];

  @ViewChild('porcentajeChart', { static: false }) porcentajeChartCanvas!: ElementRef;
  private chart: Chart<'pie'> | null = null;

  private apiBase = 'http://127.0.0.1:8000/api';
  private headers!: HttpHeaders;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    this.headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.isLoadingUsuarios = true;
    this.http.get<any>(`${this.apiBase}/usuario`, { headers: this.headers })
      .subscribe({
        next: res => {
          this.currentUserId = res.usuario.ID_user;
          this.loadCestas();
        },
        error: err => {
          console.error('Error al cargar usuario:', err);
          this.isLoadingUsuarios = false;
        }
      });
  }

  private loadCestas(): void {
    this.http.get<any[]>(`${this.apiBase}/cestas-compra`, { headers: this.headers })
      .subscribe({
        next: data => {
          // Excluir cestas del administrador
          this.cestas = data.filter(c => c.ID_user !== this.currentUserId);

          // Usuarios únicos
          const ids = Array.from(new Set(this.cestas.map(c => c.ID_user)));
          this.usuariosUnicos = ids;
          this.totalUsuarios = ids.length;

          // Si no hay usuarios, desactivar loader
          if (!ids.length) {
            this.isLoadingUsuarios = false;
            return;
          }

          // Cargar nombre de cada usuario
          let loadedNames = 0;
          ids.forEach(id => {
            this.isLoadingNombreUsuario[id] = true;
            this.http.get<any>(`${this.apiBase}/usuario/login/${id}`, { headers: this.headers })
              .subscribe({
                next: u => {
                  this.usuarios[id] = `${u.nombre} ${u.apellidos}`;
                  this.isLoadingNombreUsuario[id] = false;
                  if (++loadedNames === ids.length) {
                    // Todas las cargas de nombre hechas
                    this.isLoadingUsuarios = false;
                    this.fechaAbierta = null;              // <-- reset panel abierto
                    ids.forEach(uid => this.obtenerCestasDeUsuario(uid, true));
                  }
                },
                error: () => {
                  this.usuarios[id] = 'Desconocido';
                  this.isLoadingNombreUsuario[id] = false;
                  if (++loadedNames === ids.length) {
                    this.isLoadingUsuarios = false;
                    this.fechaAbierta = null;              // <-- reset panel abierto
                    ids.forEach(uid => this.obtenerCestasDeUsuario(uid, true));
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
    return this.usuarios[id] || '';
  }

  seleccionarUsuario(id: number): void {
    this.usuarioSeleccionado = id;
    this.cestaSeleccionada = null;
    this.productosCesta = [];
    this.porcentajesCesta = [];
    if (this.chart) { this.chart.destroy(); this.chart = null; }
    this.obtenerCestasDeUsuario(id);
  }

  obtenerCestasDeUsuario(id: number, preload: boolean = false): void {
    const userCestas = this.cestas
      .filter(c => c.ID_user === id)
      .sort((a, b) => new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime());

    this.totalCestasPorUsuario[id] = userCestas.length;
    this.cestasCargando[id] = true;

    if (!preload) {
      this.fechasAgrupadas = {};
      this.totalCestasPorDia = {};
      this.totalProductosPorFecha = {};
      this.productosCargadosPorFecha = {};
    }

    let doneCount = 0;
    userCestas.forEach(cesta => {
      const fechaKey = new Date(cesta.fecha_compra).toISOString().split('T')[0];
      this.fechasAgrupadas[fechaKey] = this.fechasAgrupadas[fechaKey] || [];
      this.fechasAgrupadas[fechaKey].push(cesta);
      this.totalCestasPorDia[fechaKey] = (this.totalCestasPorDia[fechaKey] || 0) + 1;
      this.productosCargadosPorCesta[cesta.ID_cesta] = false;
      this.totalProductosPorCesta[cesta.ID_cesta] = 0;
      this.totalProductosPorFecha[fechaKey] = this.totalProductosPorFecha[fechaKey] || 0;

      this.http.get<any>(`${this.apiBase}/admin/cesta/${cesta.ID_cesta}`, { headers: this.headers })
        .subscribe({
          next: res => {
            const productos = res.cesta.productos || [];
            this.productosPorCesta[cesta.ID_cesta] = productos;
            this.totalProductosPorCesta[cesta.ID_cesta] = productos.length;
            this.totalProductosPorFecha[fechaKey] += productos.length;
            this.productosCargadosPorCesta[cesta.ID_cesta] = true;

            // Si todas las de esa fecha terminaron:
            if (this.fechasAgrupadas[fechaKey].every(x => this.productosCargadosPorCesta[x.ID_cesta])) {
              this.productosCargadosPorFecha[fechaKey] = true;
            }

            if (++doneCount === userCestas.length) {
              this.cestasCargando[id] = false;
              this.fechaAbierta = null;          // <-- asegurar panel cerrado
            }
          },
          error: () => {
            this.productosPorCesta[cesta.ID_cesta] = [];
            this.totalProductosPorCesta[cesta.ID_cesta] = 0;
            this.productosCargadosPorCesta[cesta.ID_cesta] = true;
            if (++doneCount === userCestas.length) {
              this.cestasCargando[id] = false;
              this.fechaAbierta = null;        // <-- asegurar panel cerrado
            }
          }
        });
    });
  }

  getFechas(): string[] {
    return Object.keys(this.fechasAgrupadas)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  seleccionarCesta(cesta: any): void {
    this.cestaSeleccionada = cesta;
    this.productosCesta = this.productosPorCesta[cesta.ID_cesta] || [];
    this.porcentajesCesta = [];
    if (this.chart) { this.chart.destroy(); this.chart = null; }
    this.renderizarGraficoDeCesta(cesta.ID_cesta);
  }

  private renderizarGraficoDeCesta(id: number): void {
    this.isLoadingCestas = true;
    this.http.get<any[]>(`${this.apiBase}/cestas/${id}/porcentajes`, { headers: this.headers })
      .subscribe({
        next: data => {
          this.porcentajesCesta = data;
          this.isLoadingCestas = false;
          setTimeout(() => {
            this.cdRef.detectChanges();
            this.renderizarGrafico();
          }, 0);
        },
        error: err => {
          console.error('Error porcentajes:', err);
          this.isLoadingCestas = false;
        }
      });
  }

  private renderizarGrafico(): void {
    if (!this.porcentajeChartCanvas) return;
    const ctx = this.porcentajeChartCanvas.nativeElement;
    if (!this.porcentajesCesta.length) return;

    const labels = this.porcentajesCesta.map(p => p.nivel_piramide.Nombre);
    const values = this.porcentajesCesta.map(p => +p.porcentaje);

    const bg = [
      'rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)',
      'rgba(255,206,86,0.7)', 'rgba(75,192,192,0.7)',
      'rgba(153,102,255,0.7)'
    ];
    const bc = bg.map(c => c.replace('0.7','1'));

    const chartData: ChartData<'pie'> = { labels, datasets:[{ data: values, backgroundColor: bg, borderColor: bc, borderWidth: 1 }] };
    const chartOpts: ChartOptions<'pie'> = {
      responsive:true,
      plugins:{ legend:{ position:'bottom' }, title:{ display:true, text:`Distribución cesta ${this.cestaSeleccionada.ID_cesta}` } }
    };

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(ctx, { type:'pie', data:chartData, options:chartOpts });
  }
}
