import { Pipe, PipeTransform } from "@angular/core";
import { CurrencyPipe } from '@angular/common';
import { ProjectSettings } from '@assets/settings/company-settings';

@Pipe({
  name: 'currency',
  pure: true
})
export class CurrencyCustomPipe implements PipeTransform {

  public transform(value: any, display?: (string | boolean), digitsInfo?: string, locale?: string): string {  

    let _locale = (window.localStorage.getItem('Language') || ProjectSettings.companySettings().language);
    let _currency = (window.localStorage.getItem('Currency') || ProjectSettings.companySettings().currency);

    let result = new CurrencyPipe(_locale).transform(value, _currency, display, digitsInfo, locale);

    if (display === '') {
      result = String(result).trim().replace(/\s/g, '');
    }

    return result;
  }

}