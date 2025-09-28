import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

// Services
import { StoreService } from '@pages/informations/informations.service';
import { CollaboratorsService } from '@pages/registers/collaborators/collaborators.service';

// Settings
import { setupMenu as mountMenu } from 'src/app/pages/pages.menu';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @ViewChild('sideDrawer', { static: false }) sideDrawer!: ElementRef;
  @Output() callback = new EventEmitter();

  public menuOptions;

  public getScreenWidth: any;
  public getScreenHeight: any;

  public tooltips: any[] = [];
  public status: 'open' | 'closed' = 'open';
  public isMobile: boolean;

  public user: any;
  public store: any;

  constructor(
    private router: Router,
    private collaboratorsService: CollaboratorsService,
    private storeService: StoreService
  ) { }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    if (this.getScreenWidth <= 1400) {
      this.onClose();
    }

    this.checkWhenMobile();
  }

  public ngOnInit(): void {

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.initMenu();
    this.getInfo();
    this.checkWhenMobile();

    this.callback.emit({ instance: this });
  }

  public onToggle(): void {
    (this.status == 'closed') ? this.onOpen() : this.onClose();
  }

  public onOpen(): void {
    this.status = 'open';
  }

  public onClose(): void {
    this.status = 'closed';
  }

  private initMenu(): void {

    const timer = setInterval(() => {

      const menuOptions = mountMenu();

      if (menuOptions.length > 0) {

        clearInterval(timer);

        this.menuOptions = menuOptions;

        const ativator = (event: any = null) => {

          const url = new URL(window.location.href);

          for (const item of this.menuOptions) {

            const pathname = (event ? event.url : url.pathname);

            if (item.route == pathname) {
              item.active = true;
              this.callback.emit({ data: item });
            } else {

              if (item.subItems) {

                for (const subItem of item.subItems) {

                  if (subItem.route == pathname) {
                    subItem.active = true;
                    this.callback.emit({ data: subItem });
                  } else {
                    subItem.active = false;
                  }
                }
              }

              item.active = false;
            }

            item.active = (item.route == pathname);
          }
        };

        this.router.events.subscribe((event) => {

          if (event instanceof NavigationEnd) {

            if (this.isMobile) {
              this.onClose();
            }

            ativator(event);
          }
        });

        ativator();
      }
    }, 0);
  }

  private getInfo(): void {

    this.user = {
      picture: "assets/images/profile.png"
    };

    this.collaboratorsService.getCurrentUser('MenuComponent', (user) => {

      this.user = {
        name: (user.data?.name ? user.data.name : ""),
        username: (user.data?.username ? user.data.username : ""),
        picture: (user.data?.image ? user.data.image : "assets/images/profile.png"),
        usertype: user.usertype == "admin" ? user.usertype : user.data.permissions.name
      };
    });

    this.storeService.getCurrentStore('MenuComponent', (data) => {
      this.store = data;
    });
  }

  private checkWhenMobile(): void {

    this.isMobile = (this.getScreenWidth <= 1400);

    if (this.isMobile) {
      this.onClose();
    }
  }

}
