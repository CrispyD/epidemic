import { Injectable } from '@angular/core';
import { initializeDiseseCourses, simulateDisease } from './disease/diseaseDynamics';
import { DiseaseCourse, covid19 } from './disease/diseaseDefinition';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

import * as aM from './arrayMath'
import { HttpClient } from '@angular/common/http';

// import {data} from './data/data'
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
  private plot


  private diseaseCourses: DiseaseCourse[]
  private jan1date = new Date(2020,0,1)

  constructor(private http: HttpClient) {
    this.initialize()
   }

  initialize() {
    this.resetPlot()
    this.setCase('optimistic')
    this.loadData()
    this.toggleDailyTotal()
  }

  toggleDailyTotal() {
    for (const plot of this.plot) {
      if ( plot['fun'] && plot['fun'].label==='daily') {
        plot['fun'] = {
          label:'total',
          y:undefined
        }
      } else if(plot['fun']) {
        plot['fun'] = {
          label:'daily',
          y:total2daily
        }
      }
    }
    this.sendConfig()
  }

  hideLine(lineHide) {
    for (const plot of this.plot) {
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
    for (const plot of this.plot) {
      if (plot.scale && plot.scale.type=='logarithmic') {
        plot.scale.type='linear'
      } else if (plot.scale) {
        plot.scale.type='logarithmic'
      }
    }
    this.sendConfig()
  }

  hideSource(sourceKey,hidden) {
    for (const plot of this.plot) {
      const sourceHideMe = plot.sources.find(source=>source.name === sourceKey)
      sourceHideMe.hidden = hidden
    }
    this.sendConfig()
  }

  resetPlot() {
    this.plot = JSON.parse(JSON.stringify(plotConfig))
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
    this.http.get('https://covidtracking.com/api/us/daily').toPromise().then(
      (response) => {
        this.sources['data'] = parseCovidTrackingAPI(response,this.jan1date)
        this._dataSources.next(this.sources)
      })

    this._dataSources.next(this.sources)
    this.updateResults()
  }

  updateResults() {
    this.sim.moderate.value = 1 - this.sim.asymptomatic.value- this.sim.severe.value- this.sim.critical.value

    const diseaseDefinition = covid19

    this.diseaseCourses = initializeDiseseCourses(
      this.sim, diseaseDefinition )
      
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

    const courseContagiousDays = []
    this.diseaseCourses.forEach(course => {
      const days = ([0]).concat(aM.divide(1,course['progression'] ) )
      const contagiousDays = aM.getMask(days,course.contagious)
      courseContagiousDays.push(aM.sum(contagiousDays))
    });

    const courseProportions = [this.sim.asymptomatic.value, this.sim.moderate.value , this.sim.severe.value, this.sim.critical.value]
    const contagiousDurration = aM.sum( aM.multiply(courseContagiousDurration , courseProportions) )
    const interaction = []
    this.controls.social.forEach(element =>{interaction.push(element.value)})
    const transmisability = this.sim.R0.value / contagiousDurration

    const social_spread = aM.interp1d( this.controls.days,  
      interaction.map( value => value  * transmisability )
    )

    const testNumber = []
    const testDelay = []
    const testSuccess = []

    this.controls.tests.forEach(element =>{
      testNumber.push(Math.pow(10,element.value))
      testSuccess.push(0.15)
    })
    this.controls.testDelay.forEach(element =>{
      testDelay.push(element.value)
    })
    const tests_available = aM.logInterp1d( this.controls.days, testNumber )
    const tests_delay = aM.interp1d( this.controls.days, testDelay )
    const tests_success = aM.interp1d( this.controls.days, testSuccess )
  
    this.sources = {...this.sources, simulation: simulateDisease(
      this.sim, this.diseaseCourses, social_spread, 
      tests_available, tests_delay, tests_success, contagiousDurration)
    }

    this._dataSources.next(this.sources)
    this._config.next({
      sim: this.sim,
      controls: this.controls,
      plot:this.plot
    })

  }
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



function rate2avgDays(rate) {
  const r = 1-rate
  return r / (1-r)**2
}