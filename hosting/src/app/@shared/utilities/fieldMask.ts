import { environment } from '../../../environments/environment.prod';

export class FieldMask {

  public static cpfFieldMask(value: string) {
    return value.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4").replace(/ $/, "").substring(0,14);
  }

  public static cnpjFieldMask(value: string) {
    return value.replace(/\D/g,'').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5").replace(/ $/, "").substring(0,18);
  }

  public static cpfCnpjFieldMask(value: string) {
    return value.length <= 12 ? FieldMask.cpfFieldMask(value) : FieldMask.cnpjFieldMask(value);
  }

  public static phoneFieldMask(value: string) {
    return value.replace(/\D/g,'').replace(/(\d{2})(\d{1})?(\d{4})(\d{4})/g, "($1) $2 $3-$4").replace(/ $/, "").substring(0,16);
  }

  public static postalCodeFieldMask(value: string) {
    return value.replace(/\D/g,'').replace(/(\d{5})(\d{3})/g, "$1-$2").replace(/ $/, "").substring(0,9);
  }

  public static numberFieldMask(value: string, min: number = null, max: number = null, startWithZero: boolean = false) {

    value = value.replace(/\D+/g, '');

    const num: any = (!startWithZero ? parseInt(value) : value);
    
    if (isNaN(<number>num)) { return '' }

    if ((min != null) && (max != null)) {
      if ((num >= min) && (num <= max)) { return num.toString() }
    }

    if ((min != null) || (max != null)) {
      if ((min != null) && (num < min)) { return min.toString() }
      if ((max != null) && (num > max)) { return max.toString() }
    }

    return num.toString();
  }

  public static priceFieldMask(value: string) {

    value = value.toString();
    const isNegative = value[0] == "-";

    value = (value == '0' ? '000' : value);
    value = value.replace(/(\D+)/g, '');

    value = value.replace(/([\-]*\d{2}$)/g, ',$1');

    if (value.length == 1) {value = "0,0"+ value}
    if (value.length == 3 && value[0] == ',') { value = '0' + value }
    if (value.length == 5 && value[0] == '0') { value = (value + '').substring(1) }
    if (value.length > 6) { value = value.replace(/([-]*\d{3}),(\d{2}$)/g, '.$1,$2') }
    if (value.length > 10) { value = value.replace(/([-]*\d{3}).(\d{3}),(\d{2}$)/g, '.$1.$2,$3') }


    value = value.substring(value.length - 14, value.length);
    value = isNegative && value != "0,00" ? "-"+ value : value;

    return value;
  }
  
  public static percentageFieldMask(value: string) {

    value = value.replace(/(\D+)/g, '');
    value = value.replace(/(\d{2}$)/g, ',$1');

    if (value.length == 3 && value[0] == ','){ value = '0' + value }
    if (value.length == 5 && value[0] == '0'){ value = (value + '').substring(1) }
    
    return (value.substring(value.length - 6, value.length));
  }
  
  public static quantityFieldMask(value: string) {

    value = value.replace(/(\D+)/g, '');
    value = value.replace(/(\d{3}$)/g, ',$1');

    if (value.length == 4 && value[0] == ','){
      value = '0' + value;
    }

    const parts = value.split(",");
    value = parts?.length > 1 && value[0] == '0' ? parseInt(parts[0].replace(/0{1,3}/g, '0')) + ',' +parts[1] : value;

    return (value.substring(value.length - 8, value.length));
  }

  public static dateFieldMask(value: string, locale: "BR" | "US" = (<any>environment.country)){

    value = value.replace(/(\D+)/g, '').substring(0, 8);

    if (locale == "BR") {
      
      let length = value.length;

      if (length >= 1 && length <= 2) {

        let regExp = /([0-9]{1,2})/g;

        if ((value.length == 2) && (parseInt(value) == 0)) { 
          value = value.replace(regExp, "01");
        } else if ((value.length == 2) && (parseInt(value) > 31)) { 
          value = value.replace(regExp, "31");
        } else { 
          value = value.replace(regExp, "$1");
        }
      } else if (length >= 3 && length <= 4) {

        let regExp = /([0-9]{2})([0-9]{1,2})/g;
        let slice = value.substring(2);

        if ((slice.length == 2) && (parseInt(slice) == 0)) {
          value = value.replace(regExp, "$1/01");
        } else if ((slice.length == 2) && (parseInt(slice) > 12)) {
          value = value.replace(regExp, "$1/12");
        } else {
          value = value.replace(regExp, "$1/$2");
        }
      } else if (length >= 5 && length <= 8) {
        
        let regExp = /([0-9]{2})([0-9]{2})([0-9]{1,4})/g;
        let slice = value.substring(4);

        if ((slice.length == 4) && ((parseInt(slice) == 0) || (parseInt(slice) < 1900))) {
          value = value.replace(regExp, "$1/$2/1900");
        } else {
          value = value.replace(regExp, "$1/$2/$3");
        }
      }
    } else {

      let length = value.length;

      if (length >= 1 && length <= 4) {

        let regExp = /([0-9]{1,4})/g;

        if ((value.length == 4) && ((parseInt(value) == 0) || (parseInt(value) < 1900))) {
          value = value.replace(regExp, "1900");
        } else {
          value = value.replace(regExp, "$1");
        }         
      } else if (length >= 5 && length <= 6) {

        let regExp = /([0-9]{4})([0-9]{1,2})/g;
        let slice = value.substring(5);

        if ((slice.length == 2) && (parseInt(slice) == 0)) { 
          value = value.replace(regExp, "$1-01");
        } else if ((slice.length == 2) && (parseInt(slice) > 12)) { 
          value = value.replace(regExp, "$1-12");
        } else { 
          value = value.replace(regExp, "$1-$2");
        }
      } else if (length >= 7 && length <= 8) {
                  
        let regExp = /([0-9]{4})([0-9]{2})([0-9]{1,2})/g;
        let slice = value.substring(7);

        if ((slice.length == 2) && (parseInt(slice) == 0)) { 
          value = value.replace(regExp, "$1-$2-01");
        } else if ((slice.length == 2) && (parseInt(slice) > 31)) { 
          value = value.replace(regExp, "$1-$2-31");
        } else { 
          value = value.replace(regExp, "$1-$2-$3");
        }
      }
    }
    
    return value; 
  }

  public static plateFieldMask(value: string) {
    return value.replace(/[^a-zA-Z0-9]/g,'').replace(/ $/, "").substring(0,7);
  }

  public static clearMask(value){
    return value.replaceAll(/[\.\-\_\/\(\) ]+/ig,"");
  }

}
