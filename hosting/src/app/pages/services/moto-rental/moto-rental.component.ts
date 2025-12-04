import { Component, OnInit } from '@angular/core';
import { MotoRentalTranslate } from './moto-rental.translate';
import { MotoRentalService } from './moto-rental.service';

interface MotoRentalTab {
  id: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-moto-rental',
  templateUrl: './moto-rental.component.html',
  styleUrls: ['./moto-rental.component.scss']
})
export class MotoRentalComponent implements OnInit {

  public readonly translate = MotoRentalTranslate.get();

  public tabs: MotoRentalTab[] = [
    { id: 'dashboard', label: this.translate.tabs.dashboard, route: 'painel' },
    { id: 'fleet', label: this.translate.tabs.fleet, route: 'frota' },
    { id: 'contracts', label: this.translate.tabs.contracts, route: 'contratos' },
    { id: 'settings', label: this.translate.tabs.settings, route: 'configuracoes' }
  ];

  constructor(
    private readonly motoRentalService: MotoRentalService
  ) {}

  ngOnInit(): void {
    this.motoRentalService.bootstrap();
  }
}
