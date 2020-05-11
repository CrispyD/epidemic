import { Injectable } from '@angular/core';
import { initializeDiseseCourses, simulateDisease, Course } from './disease/diseaseDynamics';
import { DiseaseDefinition, covid19 } from './disease/diseaseDefinition';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

import * as aM from './tools/arrayMath'
import { HttpClient } from '@angular/common/http';

import {plotConfig} from './plots/plotConfig'

import * as cases from './disease/diseaseCases'

import { DataSet } from './data/data-model'


interface DataSources {
  [name:string]:DataSet
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _dataSources: Subject<DataSources> = new BehaviorSubject<DataSources>({});
  public readonly dataSources: Observable<DataSources> = this._dataSources.asObservable();

  private _config = new BehaviorSubject({sim:undefined, controls:undefined, plot:undefined});
  public readonly config = this._config.asObservable();

  cases = cases

  private sources : DataSources = {}
  private controls
  private sim
  private plot = {daily:true,logScale:true,plots:[]}


  private diseaseCourses: Course[]
  private jan1date = new Date(2020,0,1)

  constructor(private http: HttpClient) {
    this.initialize()
   }

  initialize() {
    this.resetPlot()
    this.setCase('moderate')
    this.loadData()
  }

  toggleDailyTotal() {
    this.plot.daily = !this.plot.daily
    this.sendConfig()
  }

  hideLine(lineHide) {
    for (const plot of this.plot.plots) {
      const linehideMe = plot.lines.find(line=>{
        return line.y === lineHide.y
      })
      if (linehideMe){
        linehideMe.hidden = !linehideMe.hidden
      }

    }
    this.sendConfig()
  }

  sendConfig() {
    this._config.next({
      sim: this.sim,
      controls: this.controls,
      plot: this.plot
    })
  }

  toggleLinLog() {    
    this.plot.logScale = !this.plot.logScale
    this.sendConfig()
  }

  toggleSource(sourceKey) {
    for (const plot of this.plot.plots) {
      const sourceHideMe = plot.sources.find(source=>source.name === sourceKey)
      sourceHideMe.hidden = !sourceHideMe.hidden
    }
    this.sendConfig()
  }

  resetPlot() {
    this.plot.plots = JSON.parse(JSON.stringify(plotConfig))
  }

  setCase(caseName) {
    this.sim =      JSON.parse(JSON.stringify(cases[caseName].simConfig))
    this.controls = JSON.parse(JSON.stringify(cases[caseName].controls))
    this.updateResults()
  }

  updateConfig(newConfig) {
    this.controls = {...newConfig.controls}
    this.sim = {...newConfig.sim}
    this.updateResults()
  }

  loadData() {
    this.http.get('https://covidtracking.com/api/v1/us/daily.json').toPromise().then(
        (response) => {
        this.sources['data'] = parseCovidTrackingAPI(response,this.jan1date)
        this._dataSources.next(this.sources)
      })

    this._dataSources.next(this.sources)
    this.updateResults()
  }

  updateResults() {
    this.sim.moderate.value = 1 - this.sim.asymptomatic.value- this.sim.severe.value- this.sim.critical.value

    const diseaseDefinition: DiseaseDefinition[] = covid19

    this.diseaseCourses = initializeDiseseCourses( diseaseDefinition )
      
    //
    const coursediseaseDuration = []
    diseaseDefinition.forEach(course => {
      coursediseaseDuration.push( aM.sum( course.avgDays ) )
      });
        
    const courseContagiousDurration = []
    diseaseDefinition.forEach(course => {
      courseContagiousDurration.push( aM.sum(
        aM.getMask(course.avgDays,course.attributes.contagious)
        ) )
    });

    const courseAvgTransmisionDays = []
    const courseContagiousRatio = []
    this.diseaseCourses.forEach(course => {
      const steps = aM.divide(1,course['progression'].slice(1,-2))
      const days = aM.subtract(aM.cumsum(steps),aM.multiply(steps,0.5))
      const contagiousSteps = aM.getMask(steps,course.contagious.slice(1,-2))
      const contagiousDays = aM.getMask(days,course.contagious.slice(1,-2))
      const totalContagiousDays = aM.sum(contagiousSteps)
      const avgTransmision = aM.divide(aM.sum(aM.multiply(contagiousDays,contagiousSteps)),totalContagiousDays)
      courseAvgTransmisionDays.push(totalContagiousDays)
      courseContagiousRatio.push(totalContagiousDays / aM.sum(steps))
    });

    const courseProportions = [this.sim.asymptomatic.value, this.sim.moderate.value , this.sim.severe.value, this.sim.critical.value]
    const transmisionPeriod = aM.sum( aM.multiply(courseAvgTransmisionDays , courseProportions) )

    //
    
    const interaction = interpFromControl(this.controls.social,aM.interp1d)
    const transmisability = this.sim.R0.value / (transmisionPeriod)
    const social_spread = (day) => transmisability * interaction(day)

    const tests_available = interpFromControl(this.controls.tests,(x,y)=>aM.powInterp1d(x,y,10))
    const tests_delay = interpFromControl(this.controls.testDelay,aM.interp1d)
    const tests_success = (day) => 0.15

  
    this.sources = {...this.sources, model: simulateDisease(
      this.sim, this.diseaseCourses, social_spread, 
      tests_available, tests_delay, tests_success)
    }

    this.sendConfig()
    this._dataSources.next(this.sources)
    // this._config.next({
    //   sim: this.sim,
    //   controls: this.controls,
    //   plot:this.plot
    // })

  }
}

function interpFromControl(control, interpFun) {
  const days = []
  const values = []
  control.values.forEach(value =>{
    days.push(value.x.value)
    values.push(value.y.value)
  })
  return interpFun( days, values )
}

function total2daily(days,total) {
  let day = aM.diff(days)
  day = day.slice(0).concat(day)
  const daily = ([0]).concat(aM.diff(total))
  return aM.divide(daily,day)
}

interface dataMap {
  [name:string]:{
    label: string,
    value: string,
    fun?: Function;
  }
}

function parseCovidTrackingAPI(response,startDate) {

  const conversion: dataMap = {
    days:{label:'date',value:'date', fun: (x) => dateDiff(startDate,yyyymmdd2date(x)) },
    total_fatalities:{label:'fatalities',value:'death'},
    total_confirmed:{label:'positive',value:'positive'},
    total_pending:{label:'pending',value:'pending'},
    total_tests:{label:'total',value:'total'},
  }

  const channels : {[name:string]:{label:string,value:any[]}}= {}
  for (let [key, map] of Object.entries(conversion)) {
    channels[key] = {label:'',value:[]}
  }

  response.reduce((acc,element) =>{
    for (let [key, map] of Object.entries(conversion)) {
      if (map.fun) {
        acc[key].value.push(map.fun(element[map.value]))
      } else {
        acc[key].value.push(element[map.value])
      }
      acc[key].label = map.label
    }
    return acc
  },channels)

  for (const channel of Object.values(channels)) { channel.value.reverse() }

  channels['daily_test']        = {
    label:'tests',
    value: ([0]).concat( aM.diff(channels['total_tests'].value ) )
  }
  channels['daily_test_positive'] = {
    label:'confirmed',
    value: ([0]).concat( aM.diff(channels['total_confirmed'].value ) )
  }
  channels['daily_fatalities']    = {
    label:'daily fatalities',
    value: ([0]).concat( aM.diff(channels['total_fatalities'].value ) )
  }

  return {label:'Data', channels: channels}
}

function yyyymmdd2date(ymd) {
  const ymdString = ymd.toString();
  return new Date(
    ymdString.slice(0,4),
    ymdString.slice(4,6)-1,
    ymdString.slice(6,8),
  )
}

function dateDiff(startDate,endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
}