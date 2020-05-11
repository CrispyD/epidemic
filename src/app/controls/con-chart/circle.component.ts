import {
  Component,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';

@Component({
  selector: 'g[app-charts-circle]',
  template: `
    <svg:circle
      [attr.cx]="cx"
      [attr.cy]="cy"
      [attr.r]="r"
      [attr.fill]="point.active ? 'white' : 'black'"
      [attr.stroke]="stroke"
      [attr.stroke-width]="3"
      [attr.opacity]="circleOpacity"
      [attr.class]="classNames"
      [attr.pointer-events]="pointerEvents"
      [attr.data-series]="series"
      [attr.data-index]="index.toString()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircleComponent implements OnChanges {
  @Input() cx;
  @Input() cy;
  @Input() r;
  @Input() fill;
  @Input() stroke;
  @Input() data;
  @Input() series;
  @Input() classNames;
  @Input() circleOpacity;
  @Input() pointerEvents;
  @Input() uid: string;
  @Input() index: number;

  @Input() point;
  @Input() circle;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();

  @HostListener('click')
  onClick() {
    this.point.active = !this.point.active
  }



  ngOnChanges(changes: SimpleChanges): void {
    this.classNames = Array.isArray(this.classNames) ? this.classNames.join(' ') : '';
    this.classNames += 'circle' + ' draggable-' + this.uid;
  }
}
