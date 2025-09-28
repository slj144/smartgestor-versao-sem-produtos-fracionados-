import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { AuthService } from 'src/app/auth/auth.service';

// Utilities
import bootstrap from 'bootstrap/dist/js/bootstrap';

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  public pageTitle = '';
  public menuComponent;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  @HostListener('window:scroll')
  public onScroll() {
    // fecha todos os dropdown aberto ao realizar scroll
    document.querySelectorAll('.dropdown button').forEach((element) => {
      (new bootstrap.Dropdown(element)).hide();
    });
  }

  public onMenuResponse(event) {

    if (event.data) {
      this.pageTitle = event.data.title;
    }

    if (event.instance) {
      this.menuComponent = event.instance;
    }
  }

  public onOpenMenu() {
    this.menuComponent.onOpen();
  }

  public onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth']);
    });
  }

}
