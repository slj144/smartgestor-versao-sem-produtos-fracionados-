import { IToolsService } from '../services/iTools.service';

const json: any[] = require("../../../assets/internationalization/timezones.json");

export class DateTime {

  private static shared: DateTime;

  private UTCDate: Date;
  private localDate: Date;

  private currentTimezoneName: string;
  private static currentTimeZoneData: any = {};

  private requestTryCount: number = 0;

  private updateDateInterval: any = null;

  private static itoolsService: IToolsService;

  constructor(
    timezoneName: string,
    itoolsService: IToolsService
  ) {

    DateTime.itoolsService = itoolsService;

    this.currentTimezoneName = timezoneName;

    json.forEach((region) => {
      if (region.utc.indexOf(this.currentTimezoneName) != -1) {
        DateTime.currentTimeZoneData = region;
      }
    });

    this.initializeDate(() => {
      DateTime.shared = this;
    });

    this.checkSuspendedTime();
  }


  public static context(callback: () => void) {
    const timer = setInterval(() => {
      if (DateTime.shared && DateTime.shared.localDate) {
        clearInterval(timer);
        callback();
      }
    });
  }


  public initializeDate(callback: () => void = () => { }) {

    const timeBeforeRequest = new Date();

    DateTime.itoolsService.functions().call("getDate").then((res) => {

      const stringDate = res.data;
      const timeAfterRequest = new Date();
      const diffTime = (timeAfterRequest.getTime() - timeBeforeRequest.getTime());

      const offset = new Date().getTimezoneOffset() / 60;
      this.UTCDate = new Date(Date.parse(stringDate));
      this.UTCDate.setHours(this.UTCDate.getHours() + offset);

      this.localDate = new Date(Date.parse(stringDate));
      this.localDate.setHours((this.localDate.getHours() + offset) + DateTime.currentTimeZoneData.offset);

      if (diffTime > 0) {
        this.UTCDate.setTime(this.UTCDate.getTime() + diffTime);
        this.localDate.setTime(this.localDate.getTime() + diffTime);
      }

      clearInterval(this.updateDateInterval);

      this.updateDateInterval = setInterval(() => {
        this.UTCDate.setSeconds(this.UTCDate.getSeconds() + 1);
        this.localDate.setSeconds(this.localDate.getSeconds() + 1);
      }, 1000);

      callback();
    }).catch((error) => {

      if ((++this.requestTryCount) < 5) {
        setTimeout(() => {
          this.initializeDate();
        }, 1000);
      }
    });
  }


  public static getDateObjectFromString(input: string, test: boolean = false) {

    input = input ?? "";
    let date: Date;
    const dTimezone = new Date();
    const offset = dTimezone.getTimezoneOffset() / 60;

    if (input.indexOf('/') != -1) {

      input = input.trim();

      const slices = input.split(' ');
      const dateSlice = slices[0].split('/');
      const hourSlice = (slices.length > 1 && slices[1].indexOf(':') != -1 ? `T${slices[1]}` : 'T00:00:00') + '.000Z';

      date = new Date(Date.parse(`${dateSlice[2]}-${dateSlice[1]}-${dateSlice[0]}${hourSlice}`));
      date.setHours(date.getHours() + offset);
    } else {

      if (input.indexOf("T") != -1) {

        date = new Date(Date.parse(input));
      } else {

        input = input.split(':').length == 1 ? `${input}T00:00:00.000Z` : input.replace(/[ ]+/g, "T") + ".000Z";
        date = new Date(Date.parse(input));
        date.setHours(date.getHours() + offset);
      }
    }

    return date;
  }

  public static getDateObject() {
    return DateTime.getDateObjectFromString(DateTime.shared.localDate.toISOString());
  }

  public static async getAsyncDateObject() {

    return new Promise<any>((resolve, reject) => {

      const timeBeforeRequest = new Date();

      DateTime.itoolsService.functions().call("getDate").then((res) => {

        const stringDate = res.data;
        const timeAfterRequest = new Date();
        const diffTime = (timeAfterRequest.getTime() - timeBeforeRequest.getTime());

        let UTCDate: Date;
        let localDate: Date;

        const offset = new Date().getTimezoneOffset() / 60;
        UTCDate = new Date(Date.parse(stringDate));
        UTCDate.setHours(UTCDate.getHours() + offset);

        localDate = new Date(Date.parse(stringDate));
        localDate.setHours((localDate.getHours() + offset) + DateTime.currentTimeZoneData.offset);

        if (diffTime > 0) {
          UTCDate.setTime(UTCDate.getTime() + diffTime);
          localDate.setTime(localDate.getTime() + diffTime);
        }

        resolve({
          local: localDate,
          utc: UTCDate
        });
      }).catch((error) => {

        reject(error);
      });
    });
  }

  // Auxiliary Methods

  public static formatDate(input: string, returnMode: "string" | "object" | "array" = "object", locale: string = 'US', format: "D" | "H" | "DH" = "DH") {

    format = <any>format.toUpperCase();
    locale = locale.toUpperCase();

    const date = DateTime.getDateObjectFromString(input, true);

    if (date.toDateString() == 'Invalid Date') {
      return false;
    }

    const year = date.getFullYear();
    const month = ((date.getMonth() + 1) <= 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1));
    const day = (date.getDate() <= 9 ? ('0' + date.getDate()) : date.getDate());

    const hours = (date.getHours() <= 9 ? ('0' + date.getHours()) : date.getHours());
    const minutes = (date.getMinutes() <= 9 ? ('0' + date.getMinutes()) : date.getMinutes());
    const seconds = (date.getSeconds() <= 9 ? ('0' + date.getSeconds()) : date.getSeconds());

    let result: any;

    switch (returnMode.toLowerCase()) {
      case 'string':

        if (format == "DH") {
          result = (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`) + ` ${hours}:${minutes}:${seconds}`;
        } else if (format == "D") {
          result = (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`);
        } else {
          result = ` ${hours}:${minutes}:${seconds}`;
        }

        break;
      case 'array':

        result = [
          (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`),
          `${hours}:${minutes}:${seconds}`
        ];

        break;
      case 'object':

        result = {
          date: (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`),
          hours: `${hours}:${minutes}:${seconds}`
        };

        break;
    }

    return result;
  }

  public static getDate(format: string = 'DH'): string {

    format = format.toUpperCase();

    const date = DateTime.getDateObject();

    const ano = date.getFullYear();
    const mes = ((date.getMonth() + 1) <= 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1));
    const dia = (date.getDate() <= 9 ? ('0' + date.getDate()) : date.getDate());

    const horas = (date.getHours() <= 9 ? ('0' + date.getHours()) : date.getHours());
    const minutos = (date.getMinutes() <= 9 ? ('0' + date.getMinutes()) : date.getMinutes());
    const seconds = (date.getSeconds() <= 9 ? ('0' + date.getSeconds()) : date.getSeconds());

    let result = '';

    if (format == 'D') {
      result = `${ano}-${mes}-${dia}`;
    } else if (format == 'H') {
      result = `${horas}:${minutos}:${seconds}`;
    } else if (format == 'DH') {
      result = `${ano}-${mes}-${dia} ${horas}:${minutos}:${seconds}`;
    }

    return result;
  }

  public static getDateDiff(dateStart: Date, dateEnd: Date) {

    const diff = (dateStart.getTime() - dateEnd.getTime());
    const days = Math.round(((diff > 0 ? diff : (diff * (-1))) / (1000 * 3600 * 24)));

    return days;
  }

  public static getCurrentDay(date: Date = null) {

    date = (date ? date : DateTime.getDateObject());
    return (date.getDate() <= 9 ? ('0' + date.getDate()) : date.getDate());
  }

  public static getCurrentMonth(date: Date = null) {

    date = (date ? date : DateTime.getDateObject());
    return ((date.getMonth() + 1) <= 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1));
  }

  public static getCurrentYear(date: Date = null) {

    date = (date ? date : DateTime.getDateObject());
    return date.getFullYear();
  }

  public static getYesterday(date: Date = null) {

    date = (date ? date : DateTime.getDateObject());
    date.setDate(date.getDate() - 1);

    return DateTime.formatDate(date.toISOString()).date;
  }

  public static getCurrentWeek(date: Date = null) {

    date = (date ? date : DateTime.getDateObject());

    const firstDayYear: any = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((((<any>date) - firstDayYear) / 86400000) + firstDayYear.getDay() + 1) / 7);

    return week;
  }

  public static getStartWeek(date: Date = null, days: number = null): Date {

    date = (date ? date : DateTime.getDateObject());
    days = (days ? days : date.getDay());

    return new Date(date.getTime() - ((60 * 60 * 24 * 1000) * days));
  }

  public static getEndWeek(date: Date = null, days: number = null): Date {

    date = (date ? date : DateTime.getDateObject());
    days = (days ? days : (6 - date.getDay()));

    return new Date(date.getTime() + ((60 * 60 * 24 * 1000) * days));
  }

  // Utilitary Methods

  private checkSuspendedTime() {

    let last = (new Date()).getTime();
    let isUpdating: boolean = true;

    const _ = setInterval(() => {

      let current = (new Date()).getTime();

      if (((current - last) > 3000) && !isUpdating) {
        isUpdating = true;
        this.initializeDate(() => { });
      } else {
        isUpdating = false;
      }

      last = current;
    }, 200);
  }

}