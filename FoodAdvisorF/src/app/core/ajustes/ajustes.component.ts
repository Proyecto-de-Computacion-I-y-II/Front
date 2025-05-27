import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  standalone: false,
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent implements OnInit, OnDestroy {
  configData: any[] | null = null;
  originalData: any[] = [];
  loading = false;
  private subs = new Subscription();

  // Rango para la barra de productos
readonly minProductos = 60;
readonly maxProductos = 240;
readonly allowedProductos: number[] = Array.from(
  { length: ((this.maxProductos - this.minProductos) / 1) + 1 },
  (_, i) => i + this.minProductos
).filter(
  v => v % 2 === 0 && v % 3 === 0 && v % 4 === 0 && v % 5 === 0 && v % 6 === 0
);

  private apiBase = 'http://127.0.0.1:8000/api/configuraciones';
  private authHeaders!: HttpHeaders;

  constructor(private http: HttpClient) {}

ngOnInit() {
  const token = localStorage.getItem('token') || '';
  this.authHeaders = new HttpHeaders({ Authorization: `Bearer ${token}` });

  // ➡️ carga nada más entrar al componente
  this.loadConfigData();
}

  /** Carga las configuraciones */
  loadConfigData() {
    this.loading = true;
    const sub = this.http
      .get<any[]>(this.apiBase, { headers: this.authHeaders })
      .subscribe({
        next: data => {
          this.configData = data;
          this.originalData = JSON.parse(JSON.stringify(data));
          // aplicar preview de color si existe
          const colorCfg = data.find(c => c.nombre === 'color_header');
          if (colorCfg) {
            this.applyHeaderColor(colorCfg.valor);
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error al obtener las configuraciones:', err);
          this.loading = false;
        }
      });
    this.subs.add(sub);
  }

  /** Calcula % para la barra de productos */
  getProductosPercent(valor: number): number {
    const v = Math.max(this.minProductos, Math.min(this.maxProductos, valor));
    return ((v - this.minProductos) / (this.maxProductos - this.minProductos)) * 100;
  }

  /** Aplica el color al header global */
  applyHeaderColor(color: string) {
    const header = document.querySelector('.main-header') as HTMLElement | null;
    if (header) {
      header.style.backgroundColor = color;
    }
  }

  /** Captura el cambio del input[type=color] */
  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    if (!this.configData) return;
    const cfg = this.configData.find(c => c.nombre === 'color_header');
    if (cfg) {
      cfg.valor = color;
      this.applyHeaderColor(color);
    }
  }

onProductosChange(valor: number) {
  if (!this.configData) return;
  const cfg = this.configData.find(c => c.nombre === 'productos_pagina');
  if (cfg) {
    cfg.valor = valor;
    this.applyProductosCount(valor);
  }
}  

  hasChanges(): boolean {
    if (!this.configData) return false;
    return JSON.stringify(this.configData) !== JSON.stringify(this.originalData);
  }

  onCancel() {
    if (!this.configData) return;
    this.configData = JSON.parse(JSON.stringify(this.originalData));
    const origColor = this.originalData.find(c => c.nombre === 'color_header')?.valor;
    if (origColor) {
      this.applyHeaderColor(origColor);
    }
  }

  applyProductosCount(count: number) {
  console.log(`Ahora mostramos ${count} productos por página`);
}

onSave() {
  if (!this.configData) return;

  // 1) Detectar qué configuraciones han cambiado
  const updates = this.configData.filter((c, idx) =>
    c.valor !== this.originalData[idx].valor
  );

  if (updates.length === 0) {
    alert('No hay cambios que guardar.');
    return;
  }

  // 2) Generar array de llamadas PUT
const calls = updates.map(cfg => {
  console.log('Configuración a actualizar:', cfg); // 👈 Aquí ves el valor de cfg
  const valor = String(cfg.valor);
  return this.http.put(
    `${this.apiBase}/${cfg.id}`,     // URL con el id
    { "nombre": cfg.nombre, valor },            // cuerpo JSON
    { headers: this.authHeaders },   // auth header
  );
});

  // 3) Ejecutar en paralelo y actualizar vista sin recargar
  this.loading = true;
  const sub = forkJoin(calls).subscribe({
    next: () => {
      // 4) Resetear el “dirty flag”
      this.originalData = JSON.parse(JSON.stringify(this.configData!));

      // 5) Reaplicar el color en el header
      const colorCfg = this.configData!.find(c => c.nombre === 'color_header');
      if (colorCfg) {
        this.applyHeaderColor(colorCfg.valor);
      }

      // 6) Reaplicar el número de productos
      const prodCfg = this.configData!.find(c => c.nombre === 'productos_pagina');
      if (prodCfg) {
        this.applyProductosCount(+prodCfg.valor);
      }

      alert('Configuraciones guardadas con éxito.');
      this.loading = false;
      window.location.reload();
    },
    error: err => {
      console.error('Error al guardar configuraciones:', err);
      alert('Error al guardar. Inténtalo de nuevo.');
      this.loading = false;
    }
  });

  this.subs.add(sub);
}


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
