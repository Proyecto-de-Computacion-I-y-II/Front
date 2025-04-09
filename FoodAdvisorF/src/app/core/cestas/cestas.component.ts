import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Cesta {
  ID_cesta: number;
  ID_user: number;
  fecha_compra: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
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
  router: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCestasCompra();
  }

  loadCestasCompra(): void {
    this.loading = true;
    this.http.get<Cesta[]>(`${this.apiUrl}/cestas-compra`)
      .subscribe({
        next: (response) => {
          this.cestasCompra = response;
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
    this.router.navigate(['/cestas', idCesta]);
  }
}
