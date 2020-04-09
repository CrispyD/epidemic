import { Component, OnInit, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-plots',
  templateUrl: './plots.component.html',
  styleUrls: ['./plots.component.scss'],
  // encapsulation : ViewEncapsulation.None,
})
export class PlotsComponent implements OnInit {

  linLogButton = 'Linear Axes'

  config
  sources
  plotData

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.config.subscribe(config => {
      this.config = config
      this.updatePlotData()
    })
    this.dataService.dataSources.subscribe(sources => {
      this.sources = sources
      this.updatePlotData()
    })

  }

  hideLine(line) {
    console.log(line)
    this.dataService.hideLine(line)
  }

  swapLogarithmic() {
    this.config.plot.forEach(element => {
      if (element.swapLog) {
        if (element.scale.type === 'logarithmic') {
          element.scale.type = 'linear'
          element.ylim = undefined
          this.linLogButton = 'Logarithmic Axes'
        } else {
          element.scale.type = 'logarithmic'
          element.ylim = [0, 350e6]
          this.linLogButton = 'Linear Axes'
        }
      }
    })
    this.updatePlotData()

  }

  updatePlotData(){
    if (this.config.plot && this.sources) {

      this.plotData = JSON.parse(JSON. stringify(this.config.plot))
      let pCount = 0
      for(const plot of this.config.plot) {
        let sCount = 0;
        const lines = []
        for (const source of plot.sources) {
          for (const line of plot.lines) {
            if (this.sources[source.name] && this.sources[source.name].channels[line.x] && this.sources[source.name].channels[line.y]) {
              let x = this.sources[source.name].channels[line.x].value
              let y = this.sources[source.name].channels[line.y].value
              if (plot.fun) {
                if (plot.fun.y) {y = plot.fun.y(x,y)}
              }
              lines.push(
                {...line,
                  x:x,
                  y:y,
                  color:line.color[sCount],
                  hidden: source.hidden | line.hidden,
                  ...{source:source.name},
                })
            } else {
              lines.push(
                {...line,
                  x:[null],
                  y:[null],
                  color:line.color[sCount],
                  hidden: source.hidden | line.hidden,
                  ...{source:source.name},
                })
            }
          }
          sCount++
        }
        this.plotData[pCount].lines = lines
        pCount++
      }

    }
  }

  // updateVisibility() {
  //   let pCount = 0
  //   for (const plot of this.plotData) {
  //     for (const line of plot.lines) {
  //       line.hidden = this.plotConfig.sources
  //     }

  //   }

  // }
  identifierIndex = (index:number, item: any) => index;
}
