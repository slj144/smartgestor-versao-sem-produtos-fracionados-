import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, ViewEncapsulation } from '@angular/core';

// Utilities
import { $$ } from '../../utilities/essential';
import { DateTime } from '../../utilities/dateTime';

@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {  

  @Output() public callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('calendar', { static: false }) private calendar: ElementRef;

  public days: any = [];
  public months: any = [];
  public years: any = [];

  private today: any;
  private currentMonth: any;
  private currentYear: any;
  private selectYear: any;
  private selectMonth: any;
  private monthAndYear: any;

  private _settings: any = {};

  public ngOnInit() {
    
    DateTime.context(() => {

      this.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      this.months = (() => {

        let result = [];
        let data = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        $$(data).map((key, label) => {
          result.push({ value: key, label: label, selected: (key == (<number>DateTime.getCurrentMonth() - 1)) });
        });        

        return result;
      })();

      this.years = (() => {

        let result = [];

        for (let year = 2000; year <= (DateTime.getCurrentYear() + 5); year++) {
          result.push({ value: year, selected: (year == DateTime.getCurrentYear()) });
        }

        return result;
      })();

      this.today = new Date(DateTime.getDate());
      this.currentMonth = this.today.getMonth();
      this.currentYear = this.today.getFullYear();
      this.selectYear = document.getElementById("year");
      this.selectMonth = document.getElementById("month");
      this.monthAndYear = document.getElementById("monthAndYear");

      this.render();
    });

    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get settings() {
    return this._settings;
  }

  // Modal Actions

  public update(data) {
    
  }

  public render() {

    this.compose(this.currentMonth, this.currentYear);

    $$(window).resize(() => {
      this.adjustResponsive();
    });

    $$('.btn-previous').click(() => {
      this.previous();
    });

    $$('.btn-next').click(() => {
      this.next();
    });

    $$('select#month, select#year').change(() => {
      this.jump();
    });    
  }
  
  private compose(month, year) {

    let tbl = document.getElementById("calendar-body");
    let firstDay = (new Date(year, month)).getDay();

    // clearing all previous cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM

    this.monthAndYear.innerHTML = (this.months[month].label + " " + year);
    this.selectYear.value = year;
    this.selectMonth.value = month;

    const buildCell = (day?: number, events?: string) => {

      let html = '';
      let checkToday = false;

      if (date === this.today.getDate() && year === this.today.getFullYear() && month === this.today.getMonth()) {
        checkToday = true;
      }

      if (day && events) {

        html = `
          <div class="wrapper" data-date="${year}-${(month + 1) <= 9 ? ('0' + (month + 1)) : (month + 1)}-${day <= 9 ? ('0' + day) : day}">
            <button class="day ${checkToday ? 'today' : ''}">${day}</button>
            <button class="badge">${events}</button>
          </div>
        `;
      } else if (day && !events) {
        
        html = `
          <div class="wrapper" data-date="${year}-${(month + 1) <= 9 ? ('0' + (month + 1)) : (month + 1)}-${day <= 9 ? ('0' + day) : day}">
            <button class="day ${checkToday ? 'today' : ''}">${day}</button>
          </div>
        `;
      }

      return html;
    };

    // creating all cells
    let date = 1;

    for (let i = 0; i < 6; i++) {

      // creates a table row
      let row = document.createElement("tr"); 

      // creating individual cells, filing them up with data.
      for (let j = 0; j < 7; j++) {

        let cell = document.createElement("td");

        if (i === 0 && j < firstDay) {
          cell.innerHTML = buildCell();
          row.appendChild(cell);
        } else if (date > this.daysInMonth(month, year)) {              
          break;
        } else {

          cell.innerHTML = buildCell(date, '');
          row.appendChild(cell);
          
          $$(cell).add('button.day').click((e) => {
            
            const date = $$($$(e.target).parent()[0]).attr('data-date');

            this.callback.emit({
              date, tap: true
            });
          });

          date++;
        }
      }

      tbl.appendChild(row); // appending each row into calendar body.
    }
    
    this.adjustResponsive();
  }

  private daysInMonth(iMonth, iYear) {
    return (32 - new Date(iYear, iMonth, 32).getDate());
  }

  private previous() {

    this.currentYear = ((this.currentMonth === 0) ? (this.currentYear - 1) : this.currentYear);
    this.currentMonth = ((this.currentMonth === 0) ? 11 : (this.currentMonth - 1));

    this.compose(this.currentMonth, this.currentYear);
  }

  private next() {

    this.currentYear = ((this.currentMonth === 11) ? (this.currentYear + 1) : this.currentYear);
    this.currentMonth = ((this.currentMonth + 1) % 12);

    this.compose(this.currentMonth, this.currentYear);
  }

  private jump() {

    this.currentYear = parseInt(this.selectYear.value);
    this.currentMonth = parseInt(this.selectMonth.value);

    this.compose(this.currentMonth, this.currentYear);
  }

  private adjustResponsive() {

    $$('td').map((_, value) => {
      $$(value).css({ height: `${($$(value).width() - 60)}px` });
    });
  }

}
