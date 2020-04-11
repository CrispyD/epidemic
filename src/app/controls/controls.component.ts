import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  // encapsulation : ViewEncapsulation.None,
})
export class ControlsComponent implements OnInit {
  config
  cases

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.cases = this.dataService.cases

    this.dataService.config.subscribe((config)=>{
      this.config = config
    })
  }

  setCase(caseName) {
    this.dataService.setCase(caseName)
  }
  updateSocial(item,value) {
    item.value = value;
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,1.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()
  }

  increment(item){
    item.value+=0.05;
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,1.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()
  }

  decrement(item){
    item.value-=0.05;
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,1.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()}

  updateTesting(item,value) {
    item.value = Math.log10(value)
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,1.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()
  }

  incrementTesting(item){
    item.value+=0.1;
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,9.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()
  }

  decrementTesting(item){
    item.value-=0.1;
    item.value = Math.max(item.value,0);
    item.value = Math.min(item.value,9.0);
    item.value = Math.round(item.value*100)/100;
    this.updateConfig()
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

  dateFromDay(day){
    var date = new Date(2020, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day+1)); // add the number of days
  }

  incrementDate() {
    this.config.sim.dayOffset++ 
    // this.updateResults()
  }
  
  decrementDate() {
    this.config.sim.dayOffset--
    // this.updateResults()
  }

  pow10(x){
    let X = Math.pow(10,x)
    if (X < 1e3) { return Math.round(X) }
    if (X >= 1e3 && X < 1e6) { return (X/1e3).toString().slice(0,3) + 'k' }
    if (X >= 1e6 && X < 1e9) { return (X/1e6).toString().slice(0,3)  + 'M' }
    if (X >= 1e9 && X < 1e12) { return (X/1e9).toString().slice(0,3)  + 'B' }
    if (X >= 1e12 && X < 1e15) { return (X/1e9).toString().slice(0,3)  + 'T' }
  }

  postFix_kMBT(x) {
    if (x >= 1e-3 && x < 1e0) { return Math.round(x*1e2)/1e2 +' '}
    if (x >= 1e0 && x < 1e3) { return Math.round(x) +' '}
    if (x >= 1e3 && x < 1e6) { return Math.round(x/1e2)/10 + 'k' }
    if (x >= 1e6 && x < 1e9) { return Math.round(x/1e5)/10 + 'M' }
    if (x >= 1e9 && x < 1e12) { return Math.round(x/1e8)/10 + 'B' }
    if (x >= 1e12 && x < 1e15) { return Math.round(x/1e11)/10 + 'T' }
  }


  getInitialDate() {
    const date = new Date(this.config.sim.startDate.value)
    const day = date.getDay() + this.config.sim.dayOffset.value
    const month = date.getMonth() 
    const year = date.getFullYear()
    return new Date(year,month,day)
  }

  identifierIndex = (index:number, item: any) => index;
  objectKeys = (obj)=>Object.keys(obj)

}

function kMBT2number(x){
  const post = x.slice(-1)
  const num = parseInt(x.slice(0,-1))
  if (post === ' ') { return num}
  if (post === 'k') { return num*1e3}
  if (post === 'M') { return num*1e6}
  if (post === 'B') { return num*1e9}
  if (post === 'T') { return num*1e12}
}