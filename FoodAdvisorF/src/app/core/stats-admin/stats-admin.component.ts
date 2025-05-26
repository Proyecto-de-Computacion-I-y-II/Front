import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders }                 from '@angular/common/http';
import { Chart, registerables }                    from 'chart.js';

Chart.register(...registerables);

interface SuperCompras  { supermercado: string; total_comprado: number }
interface ProdPorSuper  { supermercado: string; productos: { producto: string; total_comprado: number }[] }
interface NivelPiramide { nivel: string; productos: { producto: string; total_comprado: number }[] }
interface Equilibrio    { idSupermercado: number; equilibrio: number }

@Component({
  selector: 'app-stats-admin',
  templateUrl: './stats-admin.component.html',
  standalone: false,
  styleUrls: ['./stats-admin.component.css']
})
export class StatsAdminComponent implements OnInit {
  private base    = 'http://127.0.0.1:8000/api/estadisticas';
  private headers: HttpHeaders;

  // 1) Supermercados más populares
  @ViewChild('superPopChart', { static: false }) superPopChart!: ElementRef<HTMLCanvasElement>;
  supMasPop: SuperCompras[] = [];
  private supChart!: Chart;
  loading1 = true;  error1: string|null = null;

  // 2) Productos más vendidos por supermercado
  porSuper: ProdPorSuper[] = [];
  loading2 = true;  error2: string|null = null;

  // 3) Producto top por nivel de pirámide
  piramideTopRows: { nivel: string; producto: string; cantidad: number }[] = [];
  loading3 = true;  error3: string|null = null;

  // 4) Supermercados más equilibrados
  equilibrios: Equilibrio[] = [];
  topEquilibrado: number|null = null;
  loading4 = true;  error4: string|null = null;

  // 5) % medio productos recomendados
  mediaPorcentajeRecomendado = 0;
  loading5 = true;  error5: string|null = null;

  // 6) Coste adicional medio
  mediaCosteAdicional = 0;
  loading6 = true;  error6: string|null = null;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token') || '';
    this.headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.load1();
  }

  /** 1) Supermercados más populares */
  private load1(): void {
    this.http.get<{ supermercados_mas_comprados: SuperCompras[] }>(
      `${this.base}/supers-mas-populares`, { headers: this.headers }
    ).subscribe({
      next: res => {
        this.supMasPop = res.supermercados_mas_comprados;
        setTimeout(() => this.renderChart1(), 0);
      },
      error: () => this.error1 = 'Error cargando “Supermercados más populares”',
      complete: () => {
        this.loading1 = false;
        this.load2();  // arrancamos la siguiente
      }
    });
  }

   private renderChart1(): void {
    // 1) Obtener contexto
    const canvas = this.superPopChart?.nativeElement;
    if (!canvas) {
      this.error1 = 'No fue posible acceder al canvas';
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error1 = 'No fue posible renderizar la gráfica';
      return;
    }

    // 2) Preparar datos
    const labels = this.supMasPop.map(s => s.supermercado);
    const data   = this.supMasPop.map(s => s.total_comprado);

    // 3) Destruir instancia anterior
    this.supChart?.destroy();

    // 4) Crear chart
    this.supChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Productos comprados',
          data,
          backgroundColor: '#1976d2',
          borderColor: '#115293',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Total productos' } },
          x: { title: { display: true, text: 'Supermercado' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  /** 2) Productos más vendidos por supermercado */
  private load2(): void {
    this.http.get<{ productos_mas_comprados_por_supermercado: ProdPorSuper[] }>(
      `${this.base}/productos-mas-vendidos-por-super`, { headers: this.headers }
    ).subscribe({
      next: res => this.porSuper = res.productos_mas_comprados_por_supermercado,
      error: () => this.error2 = 'Error cargando “Productos por supermercado”',
      complete: () => {
        this.loading2 = false;
        this.load3();
      }
    });
  }

  /** 3) Producto top por nivel de pirámide */
  private load3(): void {
    this.http.get<{ productos_mas_comprados_por_nivel: NivelPiramide[] }>(
      `${this.base}/productos-mas-vendidos-por-piramide`, { headers: this.headers }
    ).subscribe({
      next: res => {
        this.piramideTopRows = res.productos_mas_comprados_por_nivel.map(lvl => ({
          nivel: lvl.nivel,
          producto: lvl.productos[0]?.producto || '—',
          cantidad: lvl.productos[0]?.total_comprado || 0
        }));
      },
      error: () => this.error3 = 'Error cargando “Productos por nivel”',
      complete: () => {
        this.loading3 = false;
        this.load4();
      }
    });
  }

  /** 4) Supermercados más equilibrados */
  private load4(): void {
    this.http.get<{ supermercado_mas_equilibrado: number; resultado_final: Equilibrio[] }>(
      `${this.base}/supermercados-mas-equilibrados`, { headers: this.headers }
    ).subscribe({
      next: res => {
        this.topEquilibrado = res.supermercado_mas_equilibrado;
        this.equilibrios    = res.resultado_final;
      },
      error: () => this.error4 = 'Error cargando “Supermercados equilibrados”',
      complete: () => {
        this.loading4 = false;
        this.load5();
      }
    });
  }

  /** 5) % medio productos recomendados */
  private load5(): void {
    this.http.get<{ media_porcentaje_recomendado: number }>(
      `${this.base}/porcentaje-productos-recomendados-promedio`, { headers: this.headers }
    ).subscribe({
      next: res => this.mediaPorcentajeRecomendado = res.media_porcentaje_recomendado,
      error: () => this.error5 = 'Error cargando porcentaje recomendado',
      complete: () => {
        this.loading5 = false;
        this.load6();
      }
    });
  }

  /** 6) Coste adicional medio */
  private load6(): void {
    this.http.get<{ media_coste_adicional: number }>(
      `${this.base}/coste-adicional-equilibrarse`, { headers: this.headers }
    ).subscribe({
      next: res => this.mediaCosteAdicional = res.media_coste_adicional,
      error: () => this.error6 = 'Error cargando coste adicional',
      complete: () => this.loading6 = false
    });
  }
}
