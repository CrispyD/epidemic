import { Component, OnInit, Input, Output, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {

  totalDailyToggle="total"
  logLinearToggle="logarithmic"

  sources
  sourceKeys
  config

  plotC
  cases
  constructor(private dataService: DataService) { }

  ngOnInit(): void {

    this.dataService.config.subscribe(config => {
      this.config = config
      this.plotC = config.plot[0].lines
    })
    this.dataService.dataSources.subscribe(sources => {
      this.sources = sources
      this.sourceKeys = Object.keys(sources).sort()
    })
  }


  hideLine(line) {
    console.log(line)
    this.dataService.hideLine(line)
  }
  hideSource(event,sourceKey) {
    this.dataService.hideSource(sourceKey,!event.checked)
  }

  toggleLinLog(){
    this.dataService.toggleLinLog()
  }

  toggleTotalDaily() {
    this.dataService.toggleDailyTotal()
  }

  updateConfig(source,event) {
    source.hidden = !event.checked
    this.dataService.updateConfig(this.config)
  }

  objectValues = (obj)=>Object.values(obj)
  objectKeys = (obj)=>Object.keys(obj)

}
