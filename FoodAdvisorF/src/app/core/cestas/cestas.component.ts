import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Producto {
  ID_prod: number;
  cantidad: number;
  recomendado: boolean;
  comprado: boolean;
  deleted_at: string | null;
}

interface Cesta {
  ID_cesta: number;
  ID_user: number;
  fecha_compra: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  productos?: Producto[];
  totalProductos?: number;
}

type CestaConContador = Cesta & { localCounter: number };
@Component({
  selector: 'app-cestas',
  standalone: false,
  templateUrl: './cestas.component.html',
  styleUrl: './cestas.component.css'
})
export class CestasComponent implements OnInit {
  

  cestasCompra: CestaConContador[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCestasCompra();
  }

  loadCestasCompra(): void {
    this.loading = true;
    this.http.get<{ cestas: Cesta[] }>(`${this.apiUrl}/usuario/cestas`, { observe: 'response' })
      .subscribe({
        next: (response) => {
          this.cestasCompra = (response.body?.cestas?.sort(
            (a, b) => new Date(a.fecha_compra).getTime() - new Date(b.fecha_compra).getTime()
          ) || []).map((cesta, index) => ({
            ...cesta,
            localCounter: index + 1
          }));
        
        this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener las cestas del usuario:', error);
          this.loading = false;
          this.error = 'No se pudieron cargar las cestas del usuario';
        }
      });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  verDetallesCesta(idCesta: number) {
    this.router.navigate(['/cesta', idCesta]);
  }

  // Método para obtener detalles de una cesta específica
  getCestaDetails(idCesta: number): void {
    this.http.get<Cesta>(`${this.apiUrl}/cestas-compra/${idCesta}`)
      .subscribe({
        next: (cesta) => {
          console.log('Detalles de la cesta:', cesta);
          // Aquí puedes hacer algo con los detalles de la cesta
        },
        error: (err) => {
          console.error(`Error al obtener detalles de la cesta ${idCesta}`, err);
        }
      });
  }
}
