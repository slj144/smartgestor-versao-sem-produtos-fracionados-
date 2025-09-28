import { Component, Input } from '@angular/core';
import { PlaceholderTranslate } from './placeholder.translate';

@Component({
  selector: 'placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent {  

  @Input() loading: boolean = true;
  @Input() hasData: boolean = false;
  @Input() verticalAlign: boolean = false;
  @Input() icon: string = '';
  @Input() label: string = '';

  public translate = PlaceholderTranslate.get();

}
