import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Contador de peticiones en progreso
  private loadingCounter = 0;
  
  // Subject para el estado de loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() { }

  /**
   * Mostrar loading (incrementa contador)
   */
  show(): void {
    this.loadingCounter++;
    this.updateLoadingState();
  }

  /**
   * Ocultar loading (decrementa contador)
   */
  hide(): void {
    if (this.loadingCounter > 0) {
      this.loadingCounter--;
    }
    this.updateLoadingState();
  }

  /**
   * Forzar ocultar loading (resetea contador)
   */
  forceHide(): void {
    this.loadingCounter = 0;
    this.updateLoadingState();
  }

  /**
   * Obtener estado actual de loading
   */
  isLoading(): boolean {
    return this.loadingCounter > 0;
  }

  /**
   * Actualizar estado de loading
   */
  private updateLoadingState(): void {
    const isLoading = this.loadingCounter > 0;
    this.loadingSubject.next(isLoading);
  }
}
