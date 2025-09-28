import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges, HostListener } from "@angular/core";
import { Tooltip } from 'bootstrap/dist/js/bootstrap';

// Utilities
import { $$ } from "@shared/utilities/essential";

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective implements OnInit, OnChanges {

  @Input() tooltip: string = '';
  @Input() placement: string = 'top';
  @Input() isDisable: boolean = false;

  private instance: any = null;

  constructor(
    private element: ElementRef
  ) {}

  ngOnInit(): void {

    $$(this.element.nativeElement).blur(() => {
      this.removeTooltip();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkIfActived();
  }

  @HostListener('mouseenter', [])
  onMouseenter() {
  
    if (!this.isDisable) {

      this.instance = new Tooltip(this.element.nativeElement, {
        title: this.tooltip, 
        placement: this.placement,
        trigger: 'manual'
      })
  
      this.instance.show();
    }   
  }

  @HostListener('mouseleave', [])
  onMouseleave() {

    this.removeTooltip();

    if (this.instance) {
      this.instance.dispose();
      this.instance = null;
    }  
  }

  private removeTooltip() {

    document.querySelectorAll('.tooltip.bs-tooltip-auto').forEach((element) => {
      element.remove();
    });
  }

  private checkIfActived() {
    !(this.isDisable || ($$(this.element.nativeElement).attr('disabled') != null)) ? this.instance?.enable() : this.instance?.disable();
  }

}