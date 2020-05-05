import {
  Component,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
  OnChanges,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { formatLabel, escapeLabel } from '@swimlane/ngx-charts/';
import { id } from '@swimlane/ngx-charts/';
import { ColorHelper } from '@swimlane/ngx-charts/';

@Component({
  selector: 'g[app-charts-circle-series]',
  template: `
    <svg:g *ngIf="true">
      <svg:g
      *ngFor="let point of data.series; let i=index;"
        app-charts-circle
        class="circle"
        [point]='point'
        [cx]="circles[i].cx"
        [cy]="circles[i].cy"
        [r]="circles[i].radius"
        [fill]="circles[i].active ? 'white' : 'black'"
        [stroke]="circles[i].color"
        [class.active]="isActive({ name: circles[i].seriesName })"
        [pointerEvents]= "'all'"
        [data]="circles[i].value"
        [series]="circles[i].seriesName"
        [index]="circles[i].index"
        [classNames]="circles[i].classNames"
        [uid]="uid"
        ngx-tooltip
        [tooltipDisabled]="tooltipDisabled"
        [tooltipPlacement]="'top'"
        [tooltipType]="'tooltip'"
        [tooltipTitle]="tooltipTemplate ? undefined : getTooltipText(circles[i])"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipContext]="circles[i].data"
      />
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(250, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CircleSeriesComponent implements OnChanges, OnInit {
  @Input() data;
  @Input() type = 'standard';
  @Input() xScale;
  @Input() yScale;
  @Input() colors: ColorHelper;
  @Input() scaleType;
  @Input() visibleValue;
  @Input() activeEntries: any[];
  @Input() tooltipDisabled: boolean = false;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() uid: string;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();

  areaPath: any;
  circle: any; // active circle
  barVisible: boolean = false;
  gradientId: string;
  gradientFill: string;

  circles

  ngOnInit() {
    this.gradientId = 'grad' + id().toString();
    this.gradientFill = `url(#${this.gradientId})`;
    this.circles = []
    this.data.series.forEach((element, index) => {
      this.circles.push(this.mapDataPointToCircle(element,index))
      
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update(): void {
    this.circle = this.getActiveCircle();
  }

  getActiveCircle(): {} {
    const indexActiveDataPoint = this.data.series.findIndex(d => {
      const label = d.name;
      return label && this.visibleValue && label.toString() === this.visibleValue.toString() && d.value !== undefined;
    });

    if (indexActiveDataPoint === -1) {
      // No valid point is 'active/hovered over' at this moment.
      return undefined;
    }

    return this.mapDataPointToCircle(this.data.series[indexActiveDataPoint], indexActiveDataPoint);
  }

  mapDataPointToCircle(d: any, i: number): any {
    const seriesName = this.data.name;

    const value = d.value;
    const label = d.name;
    const tooltipLabel = formatLabel(label);

    let cx;
    if (this.scaleType === 'time') {
      cx = this.xScale(label);
    } else if (this.scaleType === 'linear') {
      cx = this.xScale(Number(label));
    } else {
      cx = this.xScale(label);
    }

    const cy = this.yScale(this.type === 'standard' ? value : d.d1);
    const radius = 7;
    const height = this.yScale.range()[0] - cy;
    const opacity = 1;

    let color;
    if (this.colors.scaleType === 'linear') {
      if (this.type === 'standard') {
        color = this.colors.getColor(value);
      } else {
        color = this.colors.getColor(d.d1);
      }
    } else {
      color = this.colors.getColor(seriesName);
    }

    const data = Object.assign({}, d, {
      series: seriesName,
      value,
      name: label
    });

    return {
      classNames: [`circle-data-${i}`],
      index:i,
      value,
      label,
      data,
      cx,
      cy,
      radius,
      height,
      tooltipLabel,
      color,
      opacity,
      seriesName,
      gradientStops: this.getGradientStops(color),
      min: d.min,
      max: d.max,
      active: false,
    };
  }

  getTooltipText({ tooltipLabel, value, seriesName, min, max }): string {
    return `
      <span class="tooltip-label">${escapeLabel(seriesName)} • ${escapeLabel(tooltipLabel)}</span>
      <span class="tooltip-val">${value.toLocaleString()}${this.getTooltipMinMaxText(min, max)}</span>
    `;
  }

  getTooltipMinMaxText(min: any, max: any) {
    if (min !== undefined || max !== undefined) {
      let result = ' (';
      if (min !== undefined) {
        if (max === undefined) {
          result += '≥';
        }
        result += min.toLocaleString();
        if (max !== undefined) {
          result += ' - ';
        }
      } else if (max !== undefined) {
        result += '≤';
      }
      if (max !== undefined) {
        result += max.toLocaleString();
      }
      result += ')';
      return result;
    } else {
      return '';
    }
  }

  getGradientStops(color) {
    return [
      {
        offset: 0,
        color,
        opacity: 0.2
      },
      {
        offset: 100,
        color,
        opacity: 1
      }
    ];
  }

  onClick(data): void {
    this.select.emit(data);
  }

  isActive(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name;
    });
    return item !== undefined;
  }

  activateCircle(): void {
    this.barVisible = true;
    this.activate.emit({ name: this.data.name });
  }

  deactivateCircle(): void {
    this.barVisible = false;
    this.circle.opacity = 0;
    this.deactivate.emit({ name: this.data.name });
  }
}
