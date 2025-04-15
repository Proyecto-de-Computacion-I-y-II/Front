import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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

@Component({
  selector: 'app-cestas',
  standalone: false,
  templateUrl: './cestas.component.html',
  styleUrl: './cestas.component.css'
})
export class CestasComponent implements OnInit {
  
  cestasCompra: Cesta[] = [];
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
    this.http.get<Cesta[]>(`${this.apiUrl}/cestas-compra`)
      .pipe(
        switchMap(cestas => {
          const productRequests = cestas.map(cesta =>
            this.http.get<Producto[]>(`${this.apiUrl}/cestas-compra/${cesta.ID_cesta}/productos`)
              .pipe(
                catchError(error => {
                  console.error(`Error al cargar productos para cesta ${cesta.ID_cesta}`, error);
                  return of([]);
                })
              )
          );
          
          return forkJoin(productRequests).pipe(
            switchMap(productosArray => {
              // Asignar productos a cada cesta
              cestas.forEach((cesta, index) => {
                cesta.productos = productosArray[index];
                cesta.totalProductos = productosArray[index].length;
              });
              return of(cestas);
            })
          );
        })
      )
      .subscribe({
        next: (cestas) => {
          // Ordenar las cestas por ID_cesta antes de asignarlas
          this.cestasCompra = cestas.sort((a, b) => a.ID_cesta - b.ID_cesta);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar las cestas de compra', err);
          this.error = 'No se pudieron cargar las cestas de compra';
          this.loading = false;
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
