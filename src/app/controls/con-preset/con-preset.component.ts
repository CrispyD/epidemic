import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-con-preset',
  templateUrl: './con-preset.component.html',
  styleUrls: ['./con-preset.component.scss']
})
export class ConPresetComponent implements OnInit {

  constructor(private dataService: DataService) { }
  cases
  ngOnInit(): void {
    this.cases = this.dataService.cases
  }
  setCase(caseName) {
    this.dataService.setCase(caseName)
  }

  objectKeys = (obj)=>Object.keys(obj)
}