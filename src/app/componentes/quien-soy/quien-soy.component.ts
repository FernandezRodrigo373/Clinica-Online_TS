import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  


@Component({
  selector: 'app-quien-soy',
  standalone: true,
  templateUrl: './quien-soy.component.html',
  styleUrls: ['./quien-soy.component.css']
})
export class QuienSoyComponent implements OnInit {

  alumno = {
    nombre: 'Rodrigo Fernandez Barbero',
    edad: 24,
    curso: 'UTN',
    imagen: 'assets/yo.jpg'  
  };

  constructor( private router: Router) { }

  ngOnInit(): void {
  }


  irAlMenu() 
    {
    this.router.navigate(['/home']);
  }


}
