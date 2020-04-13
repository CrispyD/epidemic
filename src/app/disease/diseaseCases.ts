import * as aM from '../tools/arrayMath'

const duration = 270

export const optimistic = {
  label:'Large Effect',
  simConfig :{
    duration:           {value: duration, step:1, round:0},
    population:         {value: 330e6, step:1e6, round:-6},
    initial_infection:  {value: 10,    step:1, round:0},
    dayOffset:          {value: 15,    step:1, round:0},
    R0:                 {value: 2.9,  min:0, max:5, step:.1, round:1},
    asymptomatic:       {value: 0.2,  min:0, max:0.7, step:.01, round:2},
    moderate:           {value: 0.73, min:0.0,max:1.0, step:.01, round:2},
    severe:             {value: 0.05, min:0.0,max:0.2, step:.01, round:2},
    critical:           {value: 0.02, min:0.0,max:0.1, step:.01, round:2},
},
  controls:{
    days      : [  50,   70,  84,  91, 121, 152, 182, ],
    social    : [   1,    1, .6,  .25,  .1, .1, .25,  ].map(x=>{return{value:x} }),
    tests      : [  .8, 4,  5.1, 5.3,  5.3, 5.3, 5.3, ].map(x=>{return {value:x}}),
    testDelay : aM.multiply([  1,   1,  1,   1,   1,   1,   1,   ],5).map(x=>{return {value:x}}),
  }
}


export const moderate = {
  label:'Moderate Effect',
    simConfig :{
      duration:           {value: duration, step:1, round:0},
      population:         {value: 330e6, step:1e6, round:-6},
      initial_infection:  {value: 10,    step:1, round:0},
      dayOffset:          {value: 15,    step:1, round:0},
      R0:                 {value: 2.9,  min:0, max:5, step:.1, round:1},
      asymptomatic:       {value: 0.2,  min:0, max:0.7, step:.01, round:2},
      moderate:           {value: 0.73, min:0.0,max:1.0, step:.01, round:2},
      severe:             {value: 0.05, min:0.0,max:0.2, step:.01, round:2},
      critical:           {value: 0.02, min:0.0,max:0.1, step:.01, round:2},
  },
  controls:{
    days      : [  50,   70,  84,  91, 121, 152, 182, ],
    social    : [  1,   1, .7,    .35,  .1, .1,  .25,   ].map(x=>{return{value:x} }),
    tests      : [  .8, 4,  5.1, 5.3,  5.3, 5.3, 5.3, ].map(x=>{return {value:x}}),
    testDelay : aM.multiply([  1,   1,  1,   1,   1,   1,   1,   ],5).map(x=>{return {value:x}}),
  }
}

export const pessimistic = {
  label:'Small Effect',
  simConfig :{
    duration:           {value: duration, step:1, round:0},
    population:         {value: 330e6, step:1e6, round:-6},
    initial_infection:  {value: 10,    step:1, round:0},
    dayOffset:          {value: 15,    step:1, round:0},
    R0:                 {value: 2.9,  min:0, max:5, step:.1, round:1},
    asymptomatic:       {value: 0.2,  min:0, max:0.7, step:.01, round:2},
    moderate:           {value: 0.73, min:0.0,max:1.0, step:.01, round:2},
    severe:             {value: 0.05, min:0.0,max:0.2, step:.01, round:2},
    critical:           {value: 0.02, min:0.0,max:0.1, step:.01, round:2},
},
  controls:{
    days      : [  50,   70,  84,  91, 121, 152, 182, ],
    social    : [  1,   1, .8,    .45,  .1,  .1,  .25,   ].map(x=>{return{value:x} }),
    tests      : [  .8, 4,  5.1, 5.3,  5.3, 5.3, 5.3, ].map(x=>{return {value:x}}),
    testDelay : aM.multiply([  1,   1,  1,   1,   1,   1,   1,   ],5).map(x=>{return {value:x}}),
  }
}

export const noAction = {
  label:'No Action',
  simConfig :{
    duration:           {value: duration, step:1, round:0},
    population:         {value: 330e6, step:1e6, round:-6},
    initial_infection:  {value: 10,    step:1, round:0},
    dayOffset:          {value: 15,    step:1, round:0},
    R0:                 {value: 2.9,  min:0, max:5, step:.1, round:1},
    asymptomatic:       {value: 0.2,  min:0, max:0.7, step:.01, round:2},
    moderate:           {value: 0.73, min:0.0,max:1.0, step:.01, round:2},
    severe:             {value: 0.05, min:0.0,max:0.2, step:.01, round:2},
    critical:           {value: 0.02, min:0.0,max:0.1, step:.01, round:2},
},
  controls:{
    days      : [  50, 70,  84,  91, 121, 152, 182, ],
    social    : [   1,  1,   1,   1,   1,   1,   1,   ].map(x=>{return{value:x} }),
    tests     : [  .8,  4, 5.1, 5.7, 5.9,   6,   6, ].map(x=>{return {value:x}}),
    testDelay : aM.multiply([  1,   1,  1,   1,   1,   1,   1,   ],5).map(x=>{return {value:x}}),
  }
}