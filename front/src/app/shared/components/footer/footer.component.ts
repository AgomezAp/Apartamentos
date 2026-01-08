import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Input() appName: string = 'Gestión de Apartamentos';
  @Input() version: string = '1.0.0';
  @Input() companyName: string = 'Tu Empresa';
  
  currentYear = new Date().getFullYear();
}
