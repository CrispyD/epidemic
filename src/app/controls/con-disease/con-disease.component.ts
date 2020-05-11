import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-con-disease',
  templateUrl: './con-disease.component.html',
  styleUrls: ['./con-disease.component.scss']
})
export class ConDiseaseComponent implements OnInit {
  config
  cases

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.cases = this.dataService.cases

    this.dataService.config.subscribe((config)=>{
      this.config = config
    })
  }

  incrementItem(item) {
    item.value += item.step
    if(!isNaN(item.min)) {item.value = Math.max(item.value,item.min);}
    if (!isNaN(item.max)) {item.value = Math.min(item.value,item.max);}
    if (!isNaN(item.round)) {item.value = Math.round(item.value*Math.pow(10,item.round))/Math.pow(10,item.round);}
    this.updateConfig()
  }

  decrementItem(item) {
    item.value -= item.step
    if(!isNaN(item.min)) {item.value = Math.max(item.value,item.min);}
    if (!isNaN(item.max)) {item.value = Math.min(item.value,item.max);}
    if (!isNaN(item.round)) {item.value = Math.round(item.value*Math.pow(10,item.round))/Math.pow(10,item.round);}
    this.updateConfig()
  }

  updateConfig(){
    this.dataService.updateConfig(this.config);
  }

  postFix_kMBT(x) {
    if (x >= 1e-3 && x < 1e0) { return Math.round(x*1e2)/1e2 +' '}
    if (x >= 1e0 && x < 1e3) { return Math.round(x) +' '}
    if (x >= 1e3 && x < 1e6) { return Math.round(x/1e2)/10 + 'k' }
    if (x >= 1e6 && x < 1e9) { return Math.round(x/1e5)/10 + 'M' }
    if (x >= 1e9 && x < 1e12) { return Math.round(x/1e8)/10 + 'B' }
    if (x >= 1e12 && x < 1e15) { return Math.round(x/1e11)/10 + 'T' }
  }

  dateFromDay(day){
    var date = new Date(2020, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day+1)); // add the number of days
  }

}
