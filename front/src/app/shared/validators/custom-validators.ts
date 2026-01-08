import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Valida que el valor sea un número positivo
   */
  static positiveNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseFloat(control.value);
    return value > 0 ? null : { positiveNumber: true };
  }

  /**
   * Valida que el valor no sea cero
   */
  static nonZero(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseFloat(control.value);
    return value !== 0 ? null : { nonZero: true };
  }

  /**
   * Valida que la fecha sea futura
   */
  static futureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? null : { futureDate: true };
  }

  /**
   * Valida que la fecha sea pasada
   */
  static pastDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today ? null : { pastDate: true };
  }

  /**
   * Valida que la fecha no sea anterior a una fecha específica
   */
  static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      return inputDate >= minDate ? null : { minDate: { min: minDate, actual: inputDate } };
    };
  }

  /**
   * Valida que la fecha no sea posterior a una fecha específica
   */
  static maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      return inputDate <= maxDate ? null : { maxDate: { max: maxDate, actual: inputDate } };
    };
  }

  /**
   * Valida que el valor esté dentro de un rango
   */
  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = parseFloat(control.value);
      return value >= min && value <= max ? null : { range: { min, max, actual: value } };
    };
  }

  /**
   * Valida que el teléfono tenga un formato válido
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(control.value) ? null : { phone: true };
  }

  /**
   * Valida que dos campos coincidan (para confirmación de contraseñas)
   */
  static matchFields(fieldName: string, confirmFieldName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const field = formGroup.get(fieldName);
      const confirmField = formGroup.get(confirmFieldName);

      if (!field || !confirmField) return null;

      if (confirmField.errors && !confirmField.errors['matchFields']) {
        return null;
      }

      if (field.value !== confirmField.value) {
        confirmField.setErrors({ matchFields: true });
        return { matchFields: true };
      } else {
        confirmField.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Valida que al menos uno de los campos tenga valor
   */
  static requireAtLeastOne(...fields: string[]): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const hasValue = fields.some(fieldName => {
        const field = formGroup.get(fieldName);
        return field && field.value;
      });
      return hasValue ? null : { requireAtLeastOne: true };
    };
  }

  /**
   * Valida que el valor no contenga solo espacios en blanco
   */
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { whitespace: true };
  }

  /**
   * Valida que la URL tenga un formato válido
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlRegex.test(control.value) ? null : { url: true };
  }

  /**
   * Valida que el valor contenga solo letras
   */
  static alphabetic(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const alphabeticRegex = /^[a-zA-Z\sÀ-ÿñÑ]*$/;
    return alphabeticRegex.test(control.value) ? null : { alphabetic: true };
  }

  /**
   * Valida que el valor contenga solo letras y números
   */
  static alphanumeric(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const alphanumericRegex = /^[a-zA-Z0-9\sÀ-ÿñÑ]*$/;
    return alphanumericRegex.test(control.value) ? null : { alphanumeric: true };
  }
}
