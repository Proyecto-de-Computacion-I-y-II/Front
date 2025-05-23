// configuracion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private readonly STORAGE_KEY = 'header-color-config';
  private readonly DEFAULT_COLOR = '#FFFFFF';
  private apiUrl = environment.apiUrl;
  private headerColor: string = this.DEFAULT_COLOR;

  constructor(private http: HttpClient) {}

  // Método para cargar la configuración al inicio de la app
  loadConfiguration(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🚀 Iniciando carga de configuración del header...');
      
      // Primero cargar desde localStorage para carga instantánea (si existe)
      const cachedColor = localStorage.getItem(this.STORAGE_KEY);
      if (cachedColor) {
        this.headerColor = cachedColor;
        this.applyHeaderColor(this.headerColor);
        console.log('✅ Color cargado desde cache:', this.headerColor);
      }

      // ✅ USAR TU MISMA LÓGICA DE API - Exactamente igual que tu colorHeader()
      const url = `${this.apiUrl}/configuracion/color-header`;
      
      this.http.get<any>(url).subscribe({
        next: (response) => {
          // Tu API devuelve una propiedad 'valor' que contiene el color.
          if (response && response.valor) {
            console.log('Respuesta de la API:', response);
            this.headerColor = response.valor;
            console.log('Color del header actualizado a:', this.headerColor);
            
            // Guardar en localStorage para próximas cargas
            localStorage.setItem(this.STORAGE_KEY, this.headerColor);
            // Aplicar el color inmediatamente
            this.applyHeaderColor(this.headerColor);
          } else {
            // Esto puede ocurrir si la API devuelve un objeto vacío o una estructura diferente.
            console.warn('La respuesta de la API no contiene el valor de color esperado.', response);
            this.headerColor = '#FFFFFF'; // Color por defecto en caso de respuesta inesperada
            this.applyHeaderColor(this.headerColor);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener el color del header desde la API:', error);
          // Establece un color de fallback (blanco) si la llamada a la API falla por completo.
          if (!cachedColor) {
            this.headerColor = '#FFFFFF';
            this.applyHeaderColor(this.headerColor);
          }
          resolve(); // Resolver para no bloquear la app
        }
      });
      
      console.log('Color del header actual:', this.headerColor);
    });
  }

  // Aplicar el color usando CSS variables Y actualizar la propiedad
  private applyHeaderColor(color: string): void {
    // Aplicar usando CSS variables (para compatibilidad futura)
    document.documentElement.style.setProperty('--header-bg-color', color);
    
    // También actualizar la propiedad para que funcione con tu [ngStyle]
    this.headerColor = color;
  }

  // Getter para obtener el color actual
  getHeaderColor(): string {
    return this.headerColor;
  }

  // Método para actualizar el color (para uso futuro)
  updateHeaderColor(color: string): void {
    this.headerColor = color;
    localStorage.setItem(this.STORAGE_KEY, color);
    this.applyHeaderColor(color);
  }
}

// Función factory para APP_INITIALIZER
export function initializeConfig(configService: ConfiguracionService): () => Promise<void> {
  return (): Promise<void> => {
    return configService.loadConfiguration();
  };
}
