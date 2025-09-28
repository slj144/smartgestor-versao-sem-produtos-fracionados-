import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'icon',
  template: `
    <span id="icon-wrapper" [class]="sintax"></span>
  `,
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnChanges {

  @Input() name: string;
  @Input() pack?: string;

  public sintax: string;

  public ngOnChanges(): void {
    this.pack = (this.pack ?? 'eva');
    this.sintax = `${this.pack} ${this.pack}-${this.name}`;
  }

}
