import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// Original implementation:
// https://codepen.io/tswone/pen/GLzZLd

@Component({
  selector: 'app-con-dpad',
  templateUrl: './con-dpad.component.html',
  styleUrls: ['./con-dpad.component.scss']
})
export class ConDpadComponent implements OnInit {

  constructor() { }
  
  @Output() up = new EventEmitter();
  @Output() right = new EventEmitter();
  @Output() down = new EventEmitter();
  @Output() left = new EventEmitter();

  ngOnInit(): void {
  }

}
