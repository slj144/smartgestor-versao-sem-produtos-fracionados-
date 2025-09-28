import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  public transform(value: string, length: number): string {

    length = (length || 25);

    if (value && (value.length > length)) {
      value = `${value.substr(0, (length - 3))}...`;
    }

    return value;
  }

}