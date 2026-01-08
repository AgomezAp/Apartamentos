import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { NotificationService } from './services/notification.service';

/**
 * CoreModule
 * 
 * Módulo Singleton que contiene servicios, guards e interceptors globales
 * Únicamente debe ser importado en AppModule (una sola vez)
 * 
 * Contiene:
 * - Guards (auth, admin, unsaved-changes)
 * - Interceptors (auth, error, loading)
 * - Services (auth, loading, notification)
 * - Models (user, api-response)
 */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    // Services - Singleton
    AuthService,
    LoadingService,
    NotificationService
  ]
})
export class CoreModule {
  /**
   * Constructor que previene la importación múltiple del CoreModule
   * Si se intenta importar más de una vez, lanza un error
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule ya ha sido cargado. Importa CoreModule solo en AppModule.'
      );
    }
  }
}