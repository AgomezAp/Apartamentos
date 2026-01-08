import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - Sistema de Apartamentos'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Crear Cuenta - Sistema de Apartamentos'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Recuperar Contraseña - Sistema de Apartamentos'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Restablecer Contraseña - Sistema de Apartamentos'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }