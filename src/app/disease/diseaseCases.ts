import * as aM from '../arrayMath'

const duration = 240

export const optimistic = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:4,
    R0: 2.6,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0, 50,  70,  84,    91, 121, 182,  365,],
    social    : [ 1,  1,   1, .65,    .3,  .2,  .2,   .2,].map(x=>{return{value:x} }),
    tests      : [ 0,  1.1, 3.7,  5.2, 5.4,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}


export const moderate = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:11,
    R0: 3.2,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0, 50,  70,  84,    91, 121, 182,  365,],
    social    : [ 1,  1,   1, .6,    .25,  .2,  .2,   .2,].map(x=>{return{value:x} }),
    tests      : [ 0,  1.1, 3.7,  5.2, 5.4,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}

export const pessimistic = {
    simConfig :{
    duration: duration,
    population: 330e6,
    initial_infection: 1,
    dayOffset:16,
    R0: 3.8,
    asymptomatic: 0.2,
    moderate: 0.73,
    severe: 0.05,
    critical: 0.02,
  },
  controls:{
    days      : [ 0, 50,  70,  84,    91, 121, 182,  365,],
    social    : [ 1,  1,   1, .65,    .3,  .2,  .2,   .2,].map(x=>{return{value:x} }),
    tests      : [ 0,  1.1, 3.7,  5.2, 5.4,  6.31, 6.31, 6.31,].map(x=>{return {value:x}}),
    testDelay : aM.multiply([ 1, 1,   1,  1,   1,   1,   1,     1, ],5).map(x=>{return {value:x}}),
  }
}