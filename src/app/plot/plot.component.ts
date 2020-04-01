import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';


@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit, OnChanges {

  @Input() plotData: object;
  months = ['Jan',	'Feb',	'Mar',	'Apr',	'May',	'June',	'July',	'Aug',	'Sept',	'Oct',	'Nov',	'Dec']

  lineChartData: ChartDataSets[];

  lineChartOptions: ChartOptions = {
    animation: { duration: 0 },
    elements: { point: { radius: 0,} },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'linear',
        ticks: { 
          callback: (x) => this.dateFromDay(x),
          maxTicksLimit: 9,
        },
      },],
      yAxes: []
    }
  };

  public lineChartColors: Color[] = [];
  public lineChartLegend = { position: 'left' };
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: false })
  public chart: BaseChartDirective;

  constructor() { }

  ngOnInit() {
  }
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {}

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plotData.currentValue) {

      const plotData = changes.plotData.currentValue

      this.lineChartData = [];
      this.lineChartColors = []
      for (const line of plotData.lines) {
        this.lineChartData.push({
          data: this.zip(line.x, line.y, (x, y) => ({ x, y })),
          label: line['label'],
          yAxisID: 'y',
          fill: false,
        });

        this.lineChartColors.push( { borderColor: line.color } )
      }

      
      this.lineChartOptions.scales.yAxes = [];
      const newAxis = {
        display: true,
        position: 'left',
        id: this.lineChartData[0].yAxisID,
        ticks:{
          maxTicksLimit: 10,
          callback: postFix_kMBT  },
      };

      if (plotData.ylim) {
        newAxis.ticks['min'] = plotData.ylim[0]
        newAxis.ticks['max'] = plotData.ylim[1]
      }

      if (plotData.scale && plotData.scale.type) { 
        newAxis['type'] = plotData.scale.type
        newAxis.ticks['min'] = 1
      }
      if (plotData.xlim) {
        this.lineChartOptions.scales.xAxes[0].ticks['min'] = plotData.xlim[0]
        this.lineChartOptions.scales.xAxes[0].ticks['max'] = plotData.xlim[1]
      }
      this.lineChartOptions.scales.yAxes.push(newAxis)
        
    }
  }

  // this is a hack to make charts update when making significant changes (add remove axes)
  updateChart() {
    this.chart.chart.destroy(); // Destroy the old chart

    // define the updated chart
    this.chart.datasets = this.lineChartData;
    this.chart.options = this.lineChartOptions;

    // initialize the updated chart
    this.chart.ngOnInit();
    console.log(this.chart.chart);
  }

  // "zips" two data sets together so that they can be plotted against each other
  zip(ar1, ar2, zipper) {
    return zipper
      ? ar1.map((value, index) => zipper(value, ar2[index]))
      : ar1.map((value, index) => [value, ar2[index]])
      ;
  }

  // find the MINIMUM value in an array ronded DOWN to the nearest "round"
  minRound(value, round) {
    return Math.floor(Math.min(...value) / round) * round;
  }

  // find the MAXIMUM value in an array ronded UP to the nearest "round"
  maxRound(value, round) {
    return Math.ceil(Math.max(...value) / round) * round;
  }

  dateFromDay(x){
    const jan1 = new Date(2020, 0); // initialize a date in `year-01-01`
    const today = new Date(jan1.setDate(x+1))
    const month = today.getMonth()
    const day = today.getDate()
    return this.months[month] + ' ' + day; // add the number of days
  }
}

function postFix_kMBT(x) {
  if (x >= 1e-3 && x < 1e0) { return Math.round(x*1e2)/1e2 +' '}
  if (x >= 1e0 && x < 1e3) { return Math.round(x) +' '}
  if (x >= 1e3 && x < 1e6) { return Math.round(x/1e2)/10 + 'k' }
  if (x >= 1e6 && x < 1e9) { return Math.round(x/1e5)/10 + 'M' }
  if (x >= 1e9 && x < 1e12) { return Math.round(x/1e8)/10 + 'B' }
  if (x >= 1e12 && x < 1e15) { return Math.round(x/1e11)/10 + 'T' }
}

