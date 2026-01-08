import { CanDeactivateFn } from '@angular/router';

/**
 * Interface que deben implementar los componentes que quieran
 * ser protegidos por este guard
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
  hasUnsavedChanges?: () => boolean;
}

/**
 * Guard para prevenir la navegación cuando hay cambios sin guardar
 * Muestra un diálogo de confirmación antes de abandonar la página
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  // Si el componente tiene cambios sin guardar
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    // Mostrar confirmación nativa del navegador
    return confirm(
      '¿Estás seguro de que quieres salir?\n\n' +
      'Tienes cambios sin guardar que se perderán.\n\n' +
      'Presiona OK para salir sin guardar, o Cancelar para quedarte.'
    );
  }

  // Si el componente implementa canDeactivate, usarlo
  if (component.canDeactivate) {
    return component.canDeactivate();
  }

  // Por defecto, permitir la navegación
  return true;
};
