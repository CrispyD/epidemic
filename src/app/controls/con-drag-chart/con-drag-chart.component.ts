import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener, ViewChild } from '@angular/core';
import { LineChartComponent } from '@swimlane/ngx-charts';

const jan1 = new Date('1/1/2020')

@Component({
  selector: 'app-con-drag-chart',
  templateUrl: './con-drag-chart.component.html',
  styleUrls: ['./con-drag-chart.component.scss']
})

export class ConDragChartComponent implements OnInit, OnChanges {

  
  @Input() uid;

  @Input() control;
  @Output() controlChange = new EventEmitter<string>();

  data
  
  // options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = false;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = false;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = 'day';
  yAxisLabel: string = 'social';
  timeline: boolean = false;
  tooltipDisabled: boolean = false;
  activateDrag: boolean = true;
  yAxisTickFormatting: any

  colorScheme = {
    domain: ['#df49a6', '#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  xMax
  xMin
  yMin
  yMax 
  yStep

  delay = 250;
  lastOutput;
  timeout;

  @ViewChild(LineChartComponent) lineChart:LineChartComponent;

  constructor() { }

  draggable
  ngOnInit(): void {}

  ngOnChanges(_changes: SimpleChanges) {
    this.mapData()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.lineChart.update()
  }

  mapData() {
    if (this.control.y.axisFormat) {
      this.yAxisTickFormatting = (x)=>postFix_kMBT(Math.pow(10,x))
    }

    this.draggable = {
      x:{
        min:new Date((new Date(jan1)).setDate(jan1.getDate()+ this.control.x.min)),
        max:new Date((new Date(jan1)).setDate(jan1.getDate()+ this.control.x.max)),
        step: this.control.x.step * 24*60*60*1000
       },
      y:{...this.control.y }
    }

    this.xMin = new Date('1/1/2020');
    this.xMax = new Date('1/1/2021');

    this.yMin = this.control.y.min;
    this.yMax = this.control.y.max;
    this.yStep = this.control.y.step;

    const range = this.control.x.max-this.control.x.min;
    const pre = JSON.parse(JSON.stringify(this.control.values.slice(0)[0]));
    const post = JSON.parse(JSON.stringify(this.control.values.slice(-1)[0]))
    pre.x.value = pre.x.value - range;
    post.x.value = post.x.value + range;

    const extendedValues = [pre,...this.control.values,post]
    let formattedData = extendedValues.map((value, index) => {
      const x = new Date(jan1)
      x.setDate(x.getDate()+value.x.value)
      return {
        name: new Date(x),
        value: value.y.value,
      };
    });


    this.data = [{
      name: 'test',
      series:  formattedData
    }] 
  }

  outputControl(data) {
    data[0].series.slice(1,-1).forEach((point, index) => {
      this.control.values[index].x.value = (point.name - jan1.getTime())/(24*60*60*1000);
      this.control.values[index].y.value = point.value;
    });

    this.data =[...data]
    this.data[0].series[0].value = data[0].series[1].value
    this.data[0].series.slice(-1)[0].value = data[0].series.slice(-2)[0].value

    // wait until dragging has stoped for "delay"ms before emiting the change
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.controlChange.emit(this.control);
    }, this.delay);
  }

}

function postFix_kMBT(x) {
  let sign = ''
  let value
  if (x<0) {sign='-'; x = -x}
  if (x >= 0 && x < 1e0) { value =  Math.round(x*1e2)/1e2 +' '}
  if (x >= 1e0 && x < 1e3) { value =  Math.round(x*10)/10 +' '}
  if (x >= 1e3 && x < 1e6) { value =  Math.round(x/1e2)/10 + 'k' }
  if (x >= 1e6 && x < 1e9) { value =  Math.round(x/1e5)/10 + 'M' }
  if (x >= 1e9 && x < 1e12) { value =  Math.round(x/1e8)/10 + 'B' }
  if (x >= 1e12 && x < 1e15) { value =  Math.round(x/1e11)/10 + 'T' }
  return sign + value
}