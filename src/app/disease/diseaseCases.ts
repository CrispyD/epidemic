import * as aM from '../arrayMath'

const duration = 260

export const optimistic = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:7,
    R0: 2.9,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0,  50,   70,  84,  91, 121, 182,  365,],
    social    : [ 1,   1,    1, .6,  .25,  .1,  .1,   .1,].map(x=>{return{value:x} }),
    tests     : [ 0,  1.1, 3.7,  5.1, 5.1,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}


export const moderate = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:7,
    R0: 2.9,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0, 50,  70,  84,    91, 121, 182,  365,],
    social    : [ 1,  1,   1, .7,    .35,  .1,  .1,   .1,].map(x=>{return{value:x} }),
    tests      : [ 0,  1.1, 3.7,  5.1, 5.1,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}

export const pessimistic = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:7,
    R0: 2.9,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0, 50,  70,  84,    91, 121, 182,  365,],
    social    : [ 1,  1,   1, .8,    .45,  .1,  .1,   .1,].map(x=>{return{value:x} }),
    tests      : [ 0,  1.1, 3.7,  5.1, 5.1,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}