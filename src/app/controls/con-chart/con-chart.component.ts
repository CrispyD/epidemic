import { Component, OnInit, Input, Output, EventEmitter, ContentChild, TemplateRef, ViewEncapsulation, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { LineChartComponent, calculateViewDimensions, id, getUniqueXDomainValues, getScaleType, ColorHelper } from '@swimlane/ngx-charts'
import { trigger, transition, style, animate } from '@angular/animations';

import { scaleLinear, scaleTime, scalePoint, scaleLog } from 'd3-scale';


import * as interact from 'interactjs/dist/interact.js';
enum  KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}

@Component({
  selector: 'app-con-chart',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
    >
      <svg:defs>
        <svg:clipPath [attr.id]="clipPathId">
          <svg:rect
            [attr.width]="dims.width + 10"
            [attr.height]="dims.height + 10"
            [attr.transform]="'translate(-5, -5)'"
          />
        </svg:clipPath>
      </svg:defs>
      <svg:g [attr.transform]="transform" class="line-chart chart">
        <svg:g
          ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="xScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          [trimTicks]="trimXAxisTicks"
          [rotateTicks]="rotateXAxisTicks"
          [maxTickLength]="maxXAxisTickLength"
          [tickFormatting]="xAxisTickFormatting"
          [ticks]="xAxisTicks"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showGridLines]="showGridLines"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          [trimTicks]="trimYAxisTicks"
          [maxTickLength]="maxYAxisTickLength"
          [tickFormatting]="yAxisTickFormatting"
          [ticks]="yAxisTicks"
          [referenceLines]="referenceLines"
          [showRefLines]="showRefLines"
          [showRefLabels]="showRefLabels"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g [attr.clip-path]="clipPath" [id]="'chartArea'+uid">
          <svg:g *ngFor="let series of results; trackBy: trackBy" [@animationState]="'active'">
            <svg:g
              ngx-charts-line-series
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [activeEntries]="activeEntries"
              [scaleType]="scaleType"
              [curve]="curve"
              [rangeFillOpacity]="rangeFillOpacity"
              [hasRange]="hasRange"
              [animations]="animations"
            />
          </svg:g>

          <svg:g (mouseleave)="hideCircles()">


            <svg:g *ngFor="let series of results">
            <svg:g
              ngx-charts-tooltip-area
              [dims]="dims"
              [xSet]="xSet"
              [xScale]="xScale"
              [yScale]="yScale"
              [results]="results"
              [colors]="colors"
              [tooltipDisabled]="tooltipDisabled"
              [tooltipTemplate]="seriesTooltipTemplate"
              (hover)="updateHoveredVertical($event)"
            />

              <svg:g
                app-charts-circle-series
                [xScale]="xScale"
                [yScale]="yScale"
                [colors]="colors"
                [data]="series"
                [scaleType]="scaleType"
                [visibleValue]="hoveredVertical"
                [activeEntries]="activeEntries"
                [tooltipDisabled]="tooltipDisabled"
                [tooltipTemplate]="tooltipTemplate"
                [uid]="uid"
                (select)="onClick($event)"
                (activate)="onActivate($event)"
                (deactivate)="onDeactivate($event)"
              />
            </svg:g>
          </svg:g>
        </svg:g>
      </svg:g>
      <svg:g
        ngx-charts-timeline
        *ngIf="timeline && scaleType != 'ordinal'"
        [attr.transform]="timelineTransform"
        [results]="results"
        [view]="[timelineWidth, height]"
        [height]="timelineHeight"
        [scheme]="scheme"
        [customColors]="customColors"
        [scaleType]="scaleType"
        [legend]="legend"
        (onDomainChange)="updateDomain($event)"
      >
        <svg:g *ngFor="let series of results; trackBy: trackBy">
          <svg:g
            ngx-charts-line-series
            [xScale]="timelineXScale"
            [yScale]="timelineYScale"
            [colors]="colors"
            [data]="series"
            [scaleType]="scaleType"
            [curve]="curve"
            [hasRange]="hasRange"
            [animations]="animations"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
  styleUrls: ['./con-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(
          500,
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class ConChartComponent extends LineChartComponent  {

  @Input() activeControl: boolean = true;
  @Input() activateDrag: boolean = false;
  @Input() uid: string = 'draggable';
  @Input() draggable: any;

  @Output() resultsChange: EventEmitter<any> = new EventEmitter();
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<any>;

  
  interact
  updateTimeout;
  lastUpdate = new Date().getTime();

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    let update=false
    if(this.activeControl){
      if(event.keyCode == KEY_CODE.UP_ARROW){ this.activeIncrementValues() }
      if(event.keyCode == KEY_CODE.DOWN_ARROW){ this.activeDecrementValues() }
      if(event.keyCode == KEY_CODE.RIGHT_ARROW){ this.activeIncrementDays() }
      if(event.keyCode == KEY_CODE.LEFT_ARROW){ this.activeDecrementDays() }
    }
  }

  activeIncrementDays(){
    this.results[0].series.forEach(element=>{
      if (element.active) { 
        element.name = incrementDay(element.name,this.draggable.x.step);
      }
    })
    this.timeoutUpdate()
  }
  activeDecrementDays(){
    this.results[0].series.forEach(element=>{
      if (element.active) { 
        element.name = decrementDay(element.name,this.draggable.x.step);
      }
    })
    this.timeoutUpdate()
  }
  activeIncrementValues(){
    this.results[0].series.forEach(element=>{
      if (element.active) { 
        element.value += this.draggable.y.step;
      }
    })
    this.timeoutUpdate()
  }
  activeDecrementValues(){
    this.results[0].series.forEach(element=>{
      if (element.active) { 
        element.value -= this.draggable.y.step;
      }
    })
    this.timeoutUpdate()
  }

  initial() {

    const xmin = this.xScale(this.draggable.x.min)
    const xmax = this.xScale(this.draggable.x.max)
    const x1 = this.xScale((new Date(this.draggable.x.min)).setDate((new Date(this.draggable.x.min)).getDate()+ this.draggable.x.step)) 
    const xStep = Math.abs(x1 - xmin)

    const ymin = this.yScale(this.draggable.y.min)
    const ymax = this.yScale(this.draggable.y.max)
    const y1 = this.yScale(this.draggable.y.min + this.draggable.y.step)
    const yStep = Math.abs(y1 - ymin)

    if(this.activateDrag) {
      const elementRect = this.chartElement.nativeElement.getBoundingClientRect()
      // target elements with the "draggable-uid" class
      this.interact =  interact('.draggable-' + this.uid).draggable({
        modifiers: [
          // snap the element to a grid
          interact.modifiers.snap({
            targets: [interact.createSnapGrid({
               x: xStep, 
               y: yStep, 
               offset:{
                 x: elementRect.left + this.dims.xOffset + xmin,
                 y: elementRect.top + this.margin[0] + ymax},
               limits: {
                 top: elementRect.top + this.margin[0] + ymax,
                 bottom: elementRect.top + this.margin[0] + ymin,
                 left: elementRect.left + this.dims.xOffset + xmin,
                 right: elementRect.left + this.dims.xOffset + xmax
               },
              })],
            range: Infinity,
            relativePoints: [{ x: 0.5, y: 0.5 }],
          }),
        ],
        listeners: {
          // call this function on every dragmove event
          move: event => this.drag(event)
        }
      });
    }
  }

  drag(event) {
    var target = event.target;

    // What data point needs to be moved
    const seriesName = target.getAttribute('data-series');
    const dataIndex = parseInt(target.getAttribute('data-index'));
    
    // const currentSeries = this.results.find(series => series.name === seriesName); // which series
    const currentSeries = this.results[0]; // which series
    const currentData = currentSeries.series[dataIndex]; //which point
    currentData.active = true;
    currentSeries.series.forEach(element=>{
      if (element.active) {
        const x = this.xScale.invert(this.xScale(element.name) + event.dx)
        const y = this.yScale.invert(this.yScale(element.value) + event.dy)
        element.name = x; // update
        element.value = y; // update
      }
    })
    this.timeoutUpdate()
  }

  findMinMax(){
    let Ymax = this.draggable.y.min;
    let Ymin = this.draggable.y.max;
    let Xmax = this.draggable.x.min;
    let Xmin = this.draggable.x.max;
    let YmaxInd = 0;
    let YminInd = 0;
    let XmaxInd = 0;
    let XminInd = 0;
    
    const currentSeries = this.results[0]
    currentSeries.series.forEach((element,index)=>{
      if (element.active) {

        const x = element.name; 
        const y = element.value; // update
        if (x>Xmax) {Xmax = x;XmaxInd=index}
        if (x<Xmin) {Xmin = x;XminInd=index}
        if (y>Ymax) {Ymax = y;YmaxInd=index}
        if (y<Ymin) {Ymin = y;YminInd=index}
      }
    })
    return {
      x:{
        min:{
          value:Xmin,
          ind:XminInd
        },
        max:{
          value:Xmax,
          ind:XmaxInd
        },
      },
      y:{
        min:{
          value:Ymin,
          ind:YminInd
        },
        max:{
          value:Ymax,
          ind:YmaxInd
        },
      }
    }
  }
  
    fixMinMax(){
      const currentSeries = this.results[0]
      const minMax = this.findMinMax()

      if (minMax.x.min.value<this.draggable.x.min) {
        const x_error = this.draggable.x.min - minMax.x.min.value;
        currentSeries.series.forEach((element)=>{
          if (element.active) { 
              element.name = new Date(element.name.getTime() + x_error) 
          }
        })
      }
  
      if (minMax.x.max.value>this.draggable.x.max) {
        const x_error = minMax.x.max.value - this.draggable.x.max ;
        currentSeries.series.forEach((element)=>{
          if (element.active) { element.name = new Date(element.name.getTime() - x_error) }
        })
      }
      
      if (minMax.y.min.value<this.draggable.y.min) {
        const y_error = this.draggable.y.min - minMax.y.min.value;
        currentSeries.series.forEach((element)=>{
          if (element.active) { element.value += y_error }
        })
      }
  
      if (minMax.y.max.value>this.draggable.y.max) {
        const y_error = minMax.y.max.value - this.draggable.y.max;
        currentSeries.series.forEach((element)=>{
          if (element.active) { element.value -= y_error }
        })
      }
    }

    fixOverlap(){
      const currentSeries = this.results[0]
      const minMax = this.findMinMax()
      currentSeries.series.slice(minMax.x.max.ind,-1).forEach((element,index,array) => {
        if (array[index+1]) {
          if ((array[index+1].name - array[index].name)<(24*60*60*1000*this.draggable.x.step)) {
            if (array[index].name<this.draggable.x.max) {
              array[index+1].name = incrementDay(array[index].name,this.draggable.x.step)
            } else {
              array[index].name = decrementDay(array[index+1].name,this.draggable.x.step)
            }
          }
        }
      });

      currentSeries.series.slice(1,minMax.x.min.ind+1).reverse().forEach((element,index,array) => {
        if (array[index+1]) {
          if ((array[index].name - array[index+1].name)<(24*60*60*1000*this.draggable.x.step)) {
            if (array[index].name>this.draggable.x.min) {
              array[index+1].name = decrementDay(array[index].name,this.draggable.x.step)
            } else {
              array[index].name = incrementDay(array[index+1].name,this.draggable.x.step)
            }
          }
        }
      })
  
      currentSeries.series.slice(1,-1).forEach((element,index,array) => {
        if (array[index+1]) {
          if ((array[index+1].name - array[index].name)<(24*60*60*1000*this.draggable.x.step)) {
            if (array[index].name<this.draggable.x.max) {
              array[index+1].name = incrementDay(array[index].name,this.draggable.x.step)
            } else {
              array[index].name = decrementDay(array[index+1].name,this.draggable.x.step)
            }
          }
        }
      });

      currentSeries.series.slice(1,-1).reverse().forEach((element,index,array) => {
        if (array[index+1]) {
          if ((array[index].name - array[index+1].name)<(24*60*60*1000*this.draggable.x.step)) {
            if (array[index].name>this.draggable.x.min) {
              array[index+1].name = decrementDay(array[index].name,this.draggable.x.step)
            } else {
              array[index].name = incrementDay(array[index+1].name,this.draggable.x.step)
            }
          }
        }
      })
  }

  timeoutUpdate(){ // not behaving quite as intended    
    this.fixMinMax()
    this.fixOverlap() 
    const now = new Date().getTime();
    clearTimeout(this.updateTimeout);
    if (now - this.lastUpdate > 20) {
      // if last update was more than 20ms ago
      this.update(); // update immediately
      this.resultsChange.emit([...this.results])
    } else {
      // otherwise
      this.updateTimeout = setTimeout(() => {
        this.update()
        this.resultsChange.emit([...this.results])
      }, 20); // wait 20ms before updating
    }
  }

  update(): void {
    super.update();
    this.lastUpdate = new Date().getTime()

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType,
      legendPosition: this.legendPosition
    });

    if (this.timeline) {
      this.dims.height -= this.timelineHeight + this.margin[2] + this.timelinePadding;
    }

    this.xDomain = this.getXDomain();
    if (this.filteredDomain) {
      this.xDomain = this.filteredDomain;
    }

    this.yDomain = this.getYDomain();
    this.seriesDomain = this.getSeriesDomain();

    this.xScale = this.getXScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);

    this.updateTimeline();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;

    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;

    if(this.draggable) {this.initial()}
  }

  updateTimeline(): void {
    if (this.timeline) {
      this.timelineWidth = this.dims.width;
      this.timelineXDomain = this.getXDomain();
      this.timelineXScale = this.getXScale(this.timelineXDomain, this.timelineWidth);
      this.timelineYScale = this.getYScale(this.yDomain, this.timelineHeight);
      this.timelineTransform = `translate(${this.dims.xOffset}, ${-this.margin[2]})`;
    }
  }

  getXDomain(): any[] {
    let values = getUniqueXDomainValues(this.results);

    this.scaleType = getScaleType(values);
    let domain = [];

    if (this.scaleType === 'linear') {
      values = values.map(v => Number(v));
    }

    let min;
    let max;
    if (this.scaleType === 'time' || this.scaleType === 'linear') {
      min = (typeof this.xScaleMin) !== 'undefined' ? this.xScaleMin : Math.min(...values);

      max = (typeof this.xScaleMax) !== 'undefined' ? this.xScaleMax : Math.max(...values);
    }

    if (this.scaleType === 'time') {
      domain = [new Date(min), new Date(max)];
      this.xSet = [...values].sort((a, b) => {
        const aDate = a.getTime();
        const bDate = b.getTime();
        if (aDate > bDate) return 1;
        if (bDate > aDate) return -1;
        return 0;
      });
    } else if (this.scaleType === 'linear') {
      domain = [min, max];
      // Use compare function to sort numbers numerically
      this.xSet = [...values].sort((a, b) => a - b);
    } else {
      domain = values;
      this.xSet = values;
    }

    return domain;
  }

  getYDomain(): any[] {
    const domain = [];
    for (const results of this.results) {
      for (const d of results.series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }

    const values = [...domain];
    if (!this.autoScale) {
      values.push(0);
    }

    const min = (typeof this.yScaleMin) !== 'undefined' ? this.yScaleMin : Math.min(...values);

    const max = (typeof this.yScaleMax) !== 'undefined' ? this.yScaleMax : Math.max(...values);

    return [min, max];
  }

  getSeriesDomain(): any[] {
    return this.results.map(d => d.name);
  }

  getXScale(domain, width): any {
    let scale;

    if (this.scaleType === 'time') {
      scale = scaleTime().range([0, width]).domain(domain);
    } else if (this.scaleType === 'linear') {
      scale = scaleLinear().range([0, width]).domain(domain);

      if (this.roundDomains) {
        scale = scale.nice();
      }
    } else if (this.scaleType === 'ordinal') {
      scale = scalePoint().range([0, width]).padding(0.1).domain(domain);
    }

    return scale;
  }

  getYScale(domain, height): any {
    const scale = scaleLinear().range([height, 0]).domain(domain);
    // const scale = scaleLog().range([height, 0]).domain(domain);
    

    return this.roundDomains ? scale.nice() : scale;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = this.getXScale(this.xDomain, this.dims.width);
  }

  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  onClick(data): void {
    this.select.emit(data);
  }

  trackBy(index, item): string {
    return item.name;
  }

  setColors(): void {
    let domain;
    if (this.schemeType === 'ordinal') {
      domain = this.seriesDomain;
    } else {
      domain = this.yDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
  }

  getLegendOptions() {
    const opts = {
      scaleType: this.schemeType,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.legendPosition
    };
    if (opts.scaleType === 'ordinal') {
      opts.domain = this.seriesDomain;
      opts.colors = this.colors;
      opts.title = this.legendTitle;
    } else {
      opts.domain = this.yDomain;
      opts.colors = this.colors.scale;
    }
    return opts;
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onActivate(item) {
    this.deactivateAll();

    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  deactivateAll() {
    this.activeEntries = [...this.activeEntries];
    for (const entry of this.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.activeEntries = [];
  }

}

function incrementDay(date,step=1) {
  const outDate = new Date(date)
  return new Date(outDate.setDate(outDate.getDate()+step))
}

function decrementDay(date,step=1) {
  const outDate = new Date(date)
  return new Date(outDate.setDate(outDate.getDate()-step))
}