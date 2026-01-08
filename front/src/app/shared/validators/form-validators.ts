import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormValidators {
  
  /**
   * Valida que el RUC/NIT tenga un formato válido (10-13 dígitos)
   */
  static ruc(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const rucRegex = /^\d{10,13}$/;
    return rucRegex.test(control.value) ? null : { ruc: true };
  }

  /**
   * Valida que la cédula tenga un formato válido (10 dígitos)
   */
  static cedula(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cedulaRegex = /^\d{10}$/;
    return cedulaRegex.test(control.value) ? null : { cedula: true };
  }

  /**
   * Valida que el monto de renta sea mayor que los gastos
   */
  static rentGreaterThanExpenses(rentField: string, expensesField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const rent = formGroup.get(rentField);
      const expenses = formGroup.get(expensesField);

      if (!rent || !expenses || !rent.value || !expenses.value) return null;

      const rentValue = parseFloat(rent.value);
      const expensesValue = parseFloat(expenses.value);

      return rentValue > expensesValue ? null : { rentGreaterThanExpenses: true };
    };
  }

  /**
   * Valida que la fecha de fin sea posterior a la fecha de inicio
   */
  static endDateAfterStartDate(startDateField: string, endDateField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startDateField);
      const endDate = formGroup.get(endDateField);

      if (!startDate || !endDate || !startDate.value || !endDate.value) return null;

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (endDate.errors && !endDate.errors['endDateAfterStartDate']) {
        return null;
      }

      if (end <= start) {
        endDate.setErrors({ endDateAfterStartDate: true });
        return { endDateAfterStartDate: true };
      } else {
        endDate.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Valida que el número de dormitorios sea válido (1-10)
   */
  static bedrooms(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseInt(control.value);
    return value >= 1 && value <= 10 ? null : { bedrooms: true };
  }

  /**
   * Valida que el número de baños sea válido (1-10)
   */
  static bathrooms(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseInt(control.value);
    return value >= 1 && value <= 10 ? null : { bathrooms: true };
  }

  /**
   * Valida que el área sea válida (mayor a 10 m2)
   */
  static area(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseFloat(control.value);
    return value >= 10 ? null : { area: true };
  }

  /**
   * Valida que el monto de depósito sea razonable (máximo 3 meses de renta)
   */
  static depositAmount(rentField: string, maxMonths: number = 3): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const rent = formGroup.get(rentField);
      const deposit = formGroup.get('deposit_amount');

      if (!rent || !deposit || !rent.value || !deposit.value) return null;

      const rentValue = parseFloat(rent.value);
      const depositValue = parseFloat(deposit.value);
      const maxDeposit = rentValue * maxMonths;

      return depositValue <= maxDeposit ? null : { depositAmount: { max: maxDeposit } };
    };
  }

  /**
   * Valida que el número de piso sea válido
   */
  static floor(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseInt(control.value);
    return value >= -2 && value <= 100 ? null : { floor: true };
  }

  /**
   * Valida que el porcentaje de comisión sea válido (0-100)
   */
  static percentage(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = parseFloat(control.value);
    return value >= 0 && value <= 100 ? null : { percentage: true };
  }

  /**
   * Valida que el código postal tenga un formato válido
   */
  static postalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const postalCodeRegex = /^\d{4,6}$/;
    return postalCodeRegex.test(control.value) ? null : { postalCode: true };
  }

  /**
   * Valida que el número de contrato tenga un formato válido
   */
  static contractNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const contractRegex = /^[A-Z0-9]{6,20}$/;
    return contractRegex.test(control.value) ? null : { contractNumber: true };
  }

  /**
   * Valida que el IBAN tenga un formato válido
   */
  static iban(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(control.value.replace(/\s/g, '')) ? null : { iban: true };
  }
}
