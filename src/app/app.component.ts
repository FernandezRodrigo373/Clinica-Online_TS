import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'parcial';

  constructor(private router: Router) {

  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
