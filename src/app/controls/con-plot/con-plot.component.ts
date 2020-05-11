import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-con-plot',
  templateUrl: './con-plot.component.html',
  styleUrls: ['./con-plot.component.scss']
})
export class ConPlotComponent implements OnInit {
  config
  plot
  sources
  sourceKeys
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.config.subscribe(config => {
      this.config = config
      this.plot = config.plot
    })
    this.dataService.dataSources.subscribe(sources => {
      this.sources = sources
      this.sourceKeys = Object.keys(sources).sort()
    })
  }
  
  toggleSource(sourceKey) {
    this.dataService.toggleSource(sourceKey)
  }

  toggleLinLog(){
    this.dataService.toggleLinLog()
  }

  toggleTotalDaily() {
    this.dataService.toggleDailyTotal()
  }
}
