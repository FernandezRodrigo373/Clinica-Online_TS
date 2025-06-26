import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; 
import { animaciones } from './animaciones';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [animaciones]
})
export class AppComponent {
  title = 'parcial';

  constructor(private router: Router) {

  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  prepareRoute(outlet: RouterOutlet) 
  {
    const animation = outlet?.activatedRouteData?.['animation'] || '';




    return animation;

  }

}
