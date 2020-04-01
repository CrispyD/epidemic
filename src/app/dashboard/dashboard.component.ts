import { Component, OnInit } from '@angular/core';
import { initializeDiseseCourses, simulateDisease } from '../disease/diseaseDynamics';
import { DiseaseCourse, covid19 } from '../disease/diseaseDefinition';

import * as aM from '../arrayMath'
import {plotConfig} from './plotConfig'
import {data} from '../disease/data'
import { HttpClient } from '@angular/common/http';

import * as cases from '../disease/diseaseCases'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  diseaseCourses: DiseaseCourse[]
  results
  controls
  simConfig  
 
  plotConfig
  plotData
  
  data
  linLogButton = 'Linear Axes'
  covidtracking
  startDate = new Date(2020,0,1)
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.plotConfig = plotConfig    
    this.loadData()
    this.setCase('optimistic')
  }

  setCase(caseName) {
    this.simConfig = JSON.parse(JSON.stringify(cases[caseName].simConfig))
    this.controls = JSON.parse(JSON.stringify(cases[caseName].controls))
    this.updateResults()
  }

  loadData() {
    this.http.get('https://covidtracking.com/api/us/daily').toPromise().then(
      (response) => {
        this.covidtracking = parseCovidTrackingAPI(response,this.startDate)
        this.updateResults()
      }
      )

    this.data = data
    this.data['days'] = this.data.date.map((element) => {
      return Math.round( dateDiff(this.startDate, new Date(element)) )
    })
  }

  swapLogarithmic() {
    this.plotConfig.forEach(element => {
      if (element.swapLog) {
        if (element.scale.type === 'logarithmic') {
          element.scale.type = 'linear'
          element.ylim = undefined
          this.linLogButton = 'Logarithmic Axes'
        } else {
          element.scale.type = 'logarithmic'
          element.ylim = [0, 350e6]
          this.linLogButton = 'Linear Axes'
        }
      }
    })
    this.updatePlotData()

  }

  updateResults() {
    this.simConfig.moderate = 1 - this.simConfig.asymptomatic- this.simConfig.severe- this.simConfig.critical

    const diseaseDefinition = covid19

    this.diseaseCourses = initializeDiseseCourses(
      this.simConfig, diseaseDefinition )
      
    //
    const coursediseaseDuration = []
    diseaseDefinition.forEach(course => {
      coursediseaseDuration.push( aM.sum( course.avgDays ) )
      });
        
    const courseContagiousDurration = []
    diseaseDefinition.forEach(course => {
      courseContagiousDurration.push( aM.sum(
        aM.getMask(course.avgDays,course.contagious)
        ) )
    });

    const courseAvgTransmisionDays = []
    const courseContagiousRatio = []
    this.diseaseCourses.forEach(course => {
      const steps = aM.divide(1,course['progression'])
      const days = aM.subtract(aM.cumsum(steps),aM.multiply(steps,0.5))
      const contagiousSteps = aM.getMask(steps,course.contagious)
      const contagiousDays = aM.getMask(days,course.contagious)
      const totalContagiousDays = aM.sum(contagiousSteps)
      const avgTransmision = aM.divide(aM.sum(aM.multiply(contagiousDays,contagiousSteps)),totalContagiousDays)
      courseAvgTransmisionDays.push(avgTransmision)
      courseContagiousRatio.push(totalContagiousDays / aM.sum(steps))
    });

    const courseProportions = [this.simConfig.moderate , this.simConfig.asymptomatic, this.simConfig.severe, this.simConfig.critical]
    const transmisionPeriod = aM.sum( aM.multiply(courseAvgTransmisionDays , courseProportions) )

    //
    const interaction = []
    this.controls.social.forEach(element =>{interaction.push(element.value)})
    const transmisability = this.simConfig.R0 / (transmisionPeriod)

    const social_spread = aM.interp1d( this.controls.days,  
      interaction.map( value => value  * transmisability )
    )

    const testNumber = []
    const testDelay = []
    const testSuccess = []

    this.controls.tests.forEach(element =>{
      testNumber.push(Math.pow(10,element.value))
      testSuccess.push(0.16)
    })
    this.controls.testDelay.forEach(element =>{
      testDelay.push(element.value)
    })
    const tests_available = aM.logInterp1d( this.controls.days, testNumber )
    const tests_delay = aM.interp1d( this.controls.days, testDelay )
    const tests_success = aM.interp1d( this.controls.days, testSuccess )
  
    this.results = simulateDisease(
      this.simConfig, this.diseaseCourses, social_spread, 
      tests_available, tests_delay, tests_success, transmisionPeriod)

      this.updatePlotData()
  }

  updatePlotData(){
    this.plotData = JSON.parse(JSON. stringify(this.plotConfig))
    for(const plot of this.plotData) {
      for (const line of plot.lines) {
        if (this[line.source]) {
          line.x = this[line.source][line.x]
          line.y = this[line.source][line.y]
        } else {
          line.x = [null]
          line.y = [null]
        }
      }
    }

  }

  pow10(x){
    let X = Math.pow(10,x)
    if (X < 1e3) { return Math.round(X) }
    if (X >= 1e3 && X < 1e6) { return (X/1e3).toString().slice(0,3) + 'k' }
    if (X >= 1e6 && X < 1e9) { return (X/1e6).toString().slice(0,3)  + 'M' }
    if (X >= 1e9 && X < 1e12) { return (X/1e9).toString().slice(0,3)  + 'B' }
    if (X >= 1e12 && X < 1e15) { return (X/1e9).toString().slice(0,3)  + 'T' }
  }

  dateFromDay(day){
    var date = new Date(2020, 0); // initialize a date in `year-01-01`
    return new Date(date.setDate(day+1)); // add the number of days
  }

  postFix_kMBT(x) {
    if (x >= 1e-3 && x < 1e0) { return Math.round(x*1e2)/1e2 +' '}
    if (x >= 1e0 && x < 1e3) { return Math.round(x) +' '}
    if (x >= 1e3 && x < 1e6) { return Math.round(x/1e2)/10 + 'k' }
    if (x >= 1e6 && x < 1e9) { return Math.round(x/1e5)/10 + 'M' }
    if (x >= 1e9 && x < 1e12) { return Math.round(x/1e8)/10 + 'B' }
    if (x >= 1e12 && x < 1e15) { return Math.round(x/1e11)/10 + 'T' }
  }

  incrementDate() {
    this.simConfig.dayOffset++ 
    this.updateResults()
  }
  decrementDate() {
    this.simConfig.dayOffset--
    this.updateResults()
  }

  getInitialDate() {
    const day = this.startDate.getDay() + this.simConfig.dayOffset
    const month = this.startDate.getMonth() 
    const year = this.startDate.getFullYear()
    return new Date(year,month,day)
  }

}

//
interface dataMap {
  [name:string]:{
    value: string,
    fun?: Function;
  }
}
function parseCovidTrackingAPI(response,startDate) {
  const conversion: dataMap = {
    days:{value:'date', fun: (x) => dateDiff(startDate,yyyymmdd2date(x)) },
    total_fatalities:{value:'death'},
    total_confirmed:{value:'positive'},
    total_pending:{value:'pending'},
    total_tests:{value:'total'},
  }
  const output:{[name:string]:number[]} = {}
  for (let [key, map] of Object.entries(conversion)) {
    output[key] = []
  }
  response.reduce((acc,element) =>{
    for (let [key, map] of Object.entries(conversion)) {
      if (map.fun) {
        acc[key].push(map.fun(element[map.value]))
      } else {
        acc[key].push(element[map.value])
      }
    }
    return acc
  },output
  )
  for (const value of Object.values(output)) { value.reverse() }
  output['daily_test'] = ([0]).concat( aM.diff(output['total_tests'] ) )
  output['daily_test_positive'] = ([0]).concat( aM.diff(output['total_confirmed'] ) )
  output['daily_fatalities'] = ([0]).concat( aM.diff(output['total_fatalities'] ) )

  return output
}

//
function yyyymmdd2date(ymd) {
  const ymdString = ymd.toString();
  return new Date(
    ymdString.slice(0,4),
    ymdString.slice(4,6)-1,
    ymdString.slice(6,8),
  )
}

//
function dateDiff(startDate,endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
}
