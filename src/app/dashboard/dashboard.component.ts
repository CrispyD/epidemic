import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { DataService } from '../data.service';
import { map } from 'rxjs/operators';
import { ConDragChartComponent } from '../controls/con-drag-chart/con-drag-chart.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChildren(ConDragChartComponent) dragCharts: ConDragChartComponent[];
  
  constructor(private dataService: DataService) {}
  config
  social
  tests
  activeTab ='tab1';

  ngOnInit() {
    this.dataService.config.subscribe((config)=>{
      this.config = config
    })
    this.social = this.dataService.config.pipe(
      map(config=>config.controls.social)
    )
    this.tests = this.dataService.config.pipe(
      map(config=>config.controls.tests)
    )
    this.openTab(this.activeTab)
  }

  updateConfig(config,label) {
    this.config.controls[label] = config
    this.dataService.updateConfig(this.config)
  }

  
  openTab(tabName) {
    this.activeTab = tabName;
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        const element: any = x[i]
        if (element.id === tabName) {
            if (element.style.display === "flex") {
                element.style.display = "none"
            } else {
                element.style.display = "flex"
            }
        } else {
            element.style.display = "none"
        }
    };
    if (this.dragCharts) {
      this.dragCharts.forEach(
      chart => {chart.onResize(tabName)}
      );
    }
}

  identifierIndex = (index:number, item: any) => index;
}