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
    animation: { duration: 250 },
    elements: { point: { radius: 0,} },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'linear',
        ticks: { 
          callback: (x,y) => this.dateFromDay(x,y),
          minRotation: 30,
        },
      },],
      yAxes: []
    },
    legend:{position:'top',display:false},
    tooltips:{
      callbacks:{
        title: (x,y) => {
          return this.dateFromDay(x[0].xLabel,null)
        },
        label: (x,y) => {
          const dataSetName = y.datasets[x.datasetIndex].label + ": "
          return dataSetName + postFix_kMBT(x.yLabel)
        }
      }
    }
  };

  public lineChartColors: Color[] = [];
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  constructor() { }

  ngOnInit() {
  }
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {}
  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plotData.currentValue) {

      const plotData = changes.plotData.currentValue
      if (this.lineChartData == undefined) {
        this.lineChartData = [];
        this.lineChartColors = []
        for (const line of plotData.lines) {
          this.lineChartData.push({
            data: this.zip(line.x, line.y, (x, y) => ({ x, y })),
            lineTension: 0,  
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
            callback: postFix_kMBT  
          },
        };

        if ( plotData.ylim ) {
          newAxis.ticks['min'] = plotData.ylim[0]
          newAxis.ticks['max'] = plotData.ylim[1]
        }

        if ( plotData.scale && plotData.scale.type) { 
          newAxis['type'] = plotData.scale.type
          newAxis.ticks['min'] = 1
        }
        if ( plotData.xlim ) {
          this.lineChartOptions.scales.xAxes[0].ticks['min'] = plotData.xlim[0]
          this.lineChartOptions.scales.xAxes[0].ticks['max'] = plotData.xlim[1]
        }
        this.lineChartOptions.scales.yAxes.push(newAxis)
      } else {
   
        const yAxes =this.chart.chart.options.scales.yAxes[0] // just to use a shorter name
        if ( plotData.scale && plotData.scale.type === 'logarithmic' ) { 
          yAxes['type'] = 'logarithmic'
          if (plotData.ylim) {
            yAxes.ticks = { ...yAxes.ticks, min: 1,  max: plotData.ylim[1] } 
          }
        }  else if ( plotData.scale && plotData.scale.type === 'linear' )  {
          yAxes['type'] = 'linear'
          yAxes.ticks = { ...yAxes.ticks, min: 0,  max: undefined }
        } else if ( plotData.ylim ) {
          yAxes.ticks = { ...yAxes.ticks, min: plotData.ylim[0],  max: plotData.ylim[1] } 
        }

        plotData.lines.forEach((line,index) =>{
          this.lineChartData[index] = {...this.lineChartData[index],
              data: this.zip(line.x, line.y, (x, y) => ({ x, y })),
              lineTension: 0,  
              label: line['label'],
              yAxisID: 'y',
              fill: false,
              hidden:line.hidden,
            }
        })
      }
    }
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

  dateFromDay(x,y){
    const jan1 = new Date(2020, 0); // initialize a date in `year-01-01`
    const today = new Date(jan1.setDate(x+1))
    const month = today.getMonth()
    const day = today.getDate()
    return this.months[month] + ' ' + day; // add the number of days
  }
}

function postFix_kMBT(x) {
  if (x >= 1e-3 && x < 1e0) { return Math.round(x*1e2)/1e2 +' '}
  if (x >= 1e0 && x < 1e3) { return Math.round(x*10)/10 +' '}
  if (x >= 1e3 && x < 1e6) { return Math.round(x/1e2)/10 + 'k' }
  if (x >= 1e6 && x < 1e9) { return Math.round(x/1e5)/10 + 'M' }
  if (x >= 1e9 && x < 1e12) { return Math.round(x/1e8)/10 + 'B' }
  if (x >= 1e12 && x < 1e15) { return Math.round(x/1e11)/10 + 'T' }
}

