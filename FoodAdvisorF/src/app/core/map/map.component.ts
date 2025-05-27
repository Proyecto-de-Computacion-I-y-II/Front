import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 14;
  markers: any[] = [];
  allMarkets: any[] = [];
  dataSource = new MatTableDataSource<any>();
  myLocationMarker: any;
  mapInitialized = false;
  isLoading = true;

  ngOnInit(): void {
    this.setCurrentLocation();
  }

  ngAfterViewInit(): void {
    const checkMapReady = setInterval(() => {
      if (this.map && this.map.googleMap) {
        clearInterval(checkMapReady);
        this.mapInitialized = true;

        google.maps.event.addListenerOnce(this.map.googleMap!, 'idle', () => {
          this.loadSupermarketsInBounds();
        });
      }
    }, 200);
  }

  setCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.center = { lat, lng };

        this.myLocationMarker = {
          position: { lat, lng },
          title: 'Mi ubicación',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        };

        if (this.mapInitialized) {
          this.loadSupermarketsInBounds();
        }
      });
    }
  }

  getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  onBoundsChanged() {
    this.loadSupermarketsInBounds();
  }

  loadSupermarketsInBounds() {
    const mapInstance = this.map?.googleMap;
    if (!mapInstance) return;

    const bounds = mapInstance.getBounds();
    if (!bounds) return;

    this.isLoading = true; // Mostrar spinner

    const service = new google.maps.places.PlacesService(mapInstance);

    const request: google.maps.places.PlaceSearchRequest = {
      bounds,
      type: 'supermarket',
      keyword: 'Mercadona|Eroski|Carrefour|Dia'
    };

    service.nearbySearch(request, (results, status) => {
      this.isLoading = false; // Ocultar spinner al terminar
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        this.markers = [];
        this.allMarkets = [];

        results.forEach(place => {
          const lat = place.geometry?.location?.lat() || 0;
          const lng = place.geometry?.location?.lng() || 0;
          const distance = this.getDistanceKm(this.center.lat, this.center.lng, lat, lng);

          const name = place.name?.toLowerCase() || '';

          if (!(name.includes('mercadona') || name.includes('carrefour') || name.includes('eroski') || name.includes('dia'))) {
            return;
          }

          const displayName = place.name;

          const vicinity = place.vicinity || '';
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name!)}&query_place_id=${place.place_id}`;

          const marker = {
            position: { lat, lng },
            title: name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4CAF50',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 10
            },
            url: mapsUrl
          };

          this.markers.push(marker);
          this.allMarkets.push({
            name,
            vicinity,
            distance,
            mapsUrl
          });
        });


        if (this.myLocationMarker) {
          this.markers.unshift(this.myLocationMarker);
        }

        this.allMarkets.sort((a, b) => a.distance - b.distance);
        this.dataSource.data = this.allMarkets;
      }
    });
  }

  onMarkerClick(marker: any) {
    if (marker.url) {
      window.open(marker.url, '_blank');
    }
  }
  openMarketInMaps(market: any) {
    if (market.mapsUrl) {
      window.open(market.mapsUrl, '_blank');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


}
