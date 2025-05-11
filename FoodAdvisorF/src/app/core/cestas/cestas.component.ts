import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CestaService } from '../services/cesta/cesta.service';
import { Cesta } from './../../security/models/cesta';



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
  showCreateConfirmation: boolean = false;
  
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cestaService: CestaService,
    private snackBar: MatSnackBar,
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
            (a, b) => new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime()
          ) || []).map((cesta, index, array) => ({
            ...cesta,
            localCounter: array.length - index
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

  createCesta(){
    this.showCreateConfirmation = true;
  }

  closeConfirmationOnOutsideClick(){
    this.showCreateConfirmation = false;
  }

  cancelcreateCart(){
    this.showCreateConfirmation = false;
  }

  

  acceptcreateCart(){
    const now = new Date();
    this.loading = true;
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.000`;  
    this.cestaService.crearCesta(formattedDate).subscribe({
      next: (data: any) => {
        window.location.reload(); // reload the page if success
      },
      error: (error) => {
        this.snackBar.open('Algo ha fallado, inténtelo más tarde', 'Cerrar', {
          duration: 3000, // 3 seconds
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    })
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  verDetallesCesta(idCesta: number) {
    this.router.navigate(['/cestas', idCesta]);
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
