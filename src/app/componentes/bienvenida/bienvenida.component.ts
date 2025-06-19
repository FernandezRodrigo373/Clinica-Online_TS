import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css'
})
export class BienvenidaComponent {

  constructor(private router: Router)
  {}

  irALogin()
  {
    this.router.navigate(['/login']);
  }
  
  irARegistro()
  {
    this.router.navigate(['/registro']);
  }




}
