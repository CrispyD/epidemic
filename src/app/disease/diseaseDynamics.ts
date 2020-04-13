import * as aM from '../tools/arrayMath'
import { DataSet } from '../data/data-model'

// interface DiseaseAttributes {
//     contagious: boolean[],
//     symptomatic: boolean[],
//     hospital: boolean[],
//     ventalator: boolean[],
// }

class Disease {
    courses: Course[]
    population: number
    socialSpread: (day:number) => number
    testsAvailable: (day:number) => number
    testDelay: (day:number) => number
    testSuccess: (day:number) => number

    outputs: {[name:string]:number}

    constructor(courses: Course[]) {
        this.courses = courses
    }

    createState() {
        let state = [];
        this.courses.forEach(course => {
            state = [...state, ...aM.zeros(3*course.n_states)]
        });
        return state
    }

    setState(state) {
        let start = 0
        let end = 0
        this.courses.forEach(course => {
            end += 3*course.n_states
            course.setState(state.slice(start,end))
            start = end 
        });
    }

    getState() {
        let state=[]
        this.courses.forEach(course=>{
            state = [...state, ...course.getState()]
        })
        return state
    }

    getStateChange(day) {
        let contagious = 0;
        let needTest_n = 0;
        let population = 0;
        let newInfections = 0;
        this.courses.forEach(course=>{
            contagious += course.getContagious()
            needTest_n += aM.sum( course.getNeedTest() )
            population += course.getPopulation()
        })
        
        const transmissionRate = this.socialSpread(day) * contagious / population
        const testsAvailable = this.testsAvailable(day)
        let testingRate
        if (needTest_n===0) { testingRate = 1} else {
            testingRate =  Math.min(this.testSuccess(day) * testsAvailable / (needTest_n)  ,1)
        }

        let dstate = [];
        this.courses.forEach(course => {

            // normal disease progression
            course.progression[0] = transmissionRate
            const dInfected = course.dailyProgression(course.infections)
            let dPending = course.dailyProgression(course.pendingTests) 
            let dConfirmed = course.dailyProgression(course.confirmedTests)

            newInfections -= dInfected[0]
            
            // pending tests becoming confirmed
            const testDelayRate = 1/this.testDelay(day)
            let testUpdate = aM.multiply(course.pendingTests, testDelayRate) // test that become confirmed
            const dTestUpdate = course.dailyProgression(testUpdate) // confirmed test that progressed
            testUpdate = aM.add(testUpdate,dTestUpdate)
            dPending = aM.subtract(dPending,testUpdate)
            dConfirmed = aM.add(dConfirmed,testUpdate)

            // new test pending
            const needTest = course.getNeedTest()
            let newTests = aM.multiply(needTest,testingRate)
            const dNewTests = course.dailyProgression(newTests)
            newTests = aM.add(newTests,dNewTests)
            dPending = aM.add(dPending,newTests)

            dstate = [...dstate,...dInfected,...dPending,...dConfirmed]

        });

        let suseptible = 0
        let infections = 0
        let infected = 0
        let recovered = 0
        let deceased = 0
        let pending = 0
        let confirmed = 0
        let activeConfirmed = 0
        let tested = 0

        this.courses.forEach( course => {
            suseptible += course.infections[0]
            infections += aM.sum(course.infections.slice(1,-1))
            infected += aM.sum(course.infections.slice(1,-2))
            recovered += course.infections.slice(-2,-1)[0]
            deceased += course.infections.slice(-1)[0]
            pending += aM.sum(course.pendingTests)
            confirmed += aM.sum(course.confirmedTests)
            activeConfirmed += aM.sum(course.confirmedTests.slice(1,-2))
            tested += (confirmed + pending)
        })

        this.outputs = {
            suseptible: suseptible,
            infections: infections,
            infected: infected,
            recovered: recovered,
            deceased: deceased,
            contagious: contagious,
            testsAvailable: testsAvailable,
            pending: pending,
            confirmed: confirmed,
            activeConfirmed: activeConfirmed,
            tested: tested,
            testsAvalable: testsAvailable,
            testsNeeded: needTest_n / this.testSuccess(day) ,
            newInfections: newInfections
        }

        return dstate
    }

    integrand(day,state) {
        this.setState(state)
        return this.getStateChange(day)
    }
}

export class Course {
    treatedMortality: number[]
    untreatedMortality: number[]

    contagious: boolean[]
    symptomatic: boolean[]
    needHospital: boolean[]
    needVentalator: boolean[]

    progression: number[]
    n_states: number

    infections: number[]
    pendingTests: number[]
    confirmedTests: number[]

    constructor(
        minDays: number[], avgDays: number[], 
        treatedMortality: number[], untreatedMortality: number[], 
        attributes) {
        
        this.progression        = [0]
        this.treatedMortality   = [0] 
        this.untreatedMortality = [0] 
        for (const key of Object.keys(attributes)) { this[key] = [false] } // initialize disease attributes

        minDays.forEach((_element,index) => {
            // 
            this.progression = this.progression.concat(
                aM.multiply( aM.ones(minDays[index]), minDays[index] / avgDays[index] )
                )

            this.treatedMortality = this.treatedMortality.concat(
                aM.subtract( 1,
                    aM.multiply( 
                        aM.ones(minDays[index]),
                        (1-treatedMortality[index]) ** (1 / minDays[index]) )
                )
            )
        
            this.untreatedMortality = this.untreatedMortality.concat(
                aM.subtract( 1,
                    aM.multiply( 
                        aM.ones(minDays[index]),
                        (1-untreatedMortality[index]) ** (1 / minDays[index]) )
                )
            )

            //
            for (const [key, value] of Object.entries(attributes)) {
                this[key] = this[key].concat(
                    value[index] ? aM.trueArray( minDays[index] ) : aM.falseArray( minDays[index])
                ) 
            }

        })
        
        // append stages for recovered and deceased
        this.progression = this.progression.concat([0,0])
        this.treatedMortality = this.treatedMortality.concat([0,0])
        this.untreatedMortality = this.untreatedMortality.concat([0,0])
        for (const key of Object.keys(attributes)) {
            this[key] = this[key].concat([false,false]) 
        }
        this.n_states = this.progression.length
    }

    createState() {
        return aM.zeros(3*this.progression.length)
    }

    setState(state){ 
        this.infections     = state.slice(0*this.n_states,1*this.n_states)
        this.pendingTests   = state.slice(1*this.n_states,2*this.n_states)
        this.confirmedTests = state.slice(2*this.n_states,3*this.n_states)
    }

    getState() {
        return [...this.infections, ...this.pendingTests, ...this.confirmedTests]
    }

    dailyProgression(state) {

        let dState = aM.zeros(this.n_states)

        // mortality
        const mortality = this.treatedMortality
        const deaths = aM.multiply(mortality, state)
        dState[dState.length-1] += aM.sum(deaths)
        
        // baseline disease progression
        const stateDeathsRemoved = aM.subtract(state,deaths) 
        let progression = aM.multiply(this.progression, stateDeathsRemoved )
        
        // apply progression to state change
        aM.setSlice(dState,
            aM.add(      dState.slice(1,-1),  progression.slice(0,-2)),
            1,-1)
        aM.setSlice(dState,
            aM.subtract( dState.slice(0,-2), progression.slice(0,-2) ),
            0,-2)        

        return dState
    }

    getContagious() {
        return aM.sum(aM.getMask(this.infections,this.contagious))
    }

    getSymptomatic() {
        return aM.sum(aM.getMask(this.infections,this.symptomatic))
    }

    getPopulation() {
        return aM.sum(this.infections.slice(0,-1)) // everyone except the deceased
    }

    getNeedTest() {
        let needTest = aM.subtract(aM.subtract(this.infections, this.pendingTests), this.confirmedTests)
        aM.setMask(needTest,0,aM.not(this.symptomatic))
        return needTest
    }

    getFirstSymptoms() {

    }
    getNeedVentalator() {
        return aM.sum(aM.getMask(this.infections,this.needVentalator))
    }
    
}

export function initializeDiseseCourses(simConfig, diseaseDefinition) {
    
    // initialize population and infection
    const diseaseCourses = []
    for (const courseDef of diseaseDefinition) {
        diseaseCourses.push( new Course(courseDef.minDays,courseDef.avgDays,courseDef.treated,courseDef.untreated, courseDef.attributes) )
    }

    return diseaseCourses
}


export function simulateDisease(simConfig, diseaseCourses: Course[],social_spread, 
    tests_available, tests_delay, tests_success,) {

    const disease = new Disease(diseaseCourses)
    disease.socialSpread = social_spread
    disease.testsAvailable = tests_available
    disease.testSuccess = tests_success
    disease.testDelay = tests_delay

    const step = 1
    const days = aM.range(simConfig.dayOffset.value,simConfig.dayOffset.value + simConfig.duration.value,step)
    
    disease.setState(disease.createState())
    
    const courseProportions = [simConfig.asymptomatic.value, simConfig.moderate.value, simConfig.severe.value, simConfig.critical.value]
    
    disease.courses.forEach((course,index) => {
        course.infections[0] = (simConfig.population.value - simConfig.initial_infection.value) * courseProportions[index]
    })
    
    disease.courses[1].infections[1] = simConfig.initial_infection.value
    
    disease.getStateChange(days[0])
    const outputs: {[name:string]:number[]} = {}
    for(const key of Object.keys(disease.outputs) ){
        outputs[key] = []
    };

    const state = [disease.getState()]
    for (const i of aM.range(0,days.length)) {
        disease.setState(state[i])
        const stateChange = disease.getStateChange(days[i])
        state.push( aM.add(state[i], aM.multiply(stateChange,step)))

        for(const [key, value] of Object.entries(disease.outputs) ){
            outputs[key].push(value)
        };
        
    }

    let haveBeenContagious = 0
    disease.courses.forEach(course => {
        if( aM.any(course.contagious) ) {
            const initialContagiousIndex = course.contagious.findIndex(element=>element)
            haveBeenContagious += aM.sum(course.infections.slice(initialContagiousIndex))
        }
        
    });
    const contagiousDurration = aM.sum(outputs.contagious) / haveBeenContagious
    const real_R0 = aM.multiply( aM.divide(outputs.newInfections,outputs.contagious), contagiousDurration)

    const daily_test_pos = ([0]).concat(aM.diff(outputs.confirmed))
    const measured_R0 = aM.multiply( aM.divide(daily_test_pos,outputs.activeConfirmed), contagiousDurration) // should use a measured dissease durration?

    

    const results : DataSet = {
        label:'Model',
        channels:{
            
            total_susceptible: {label:'',value: outputs.suseptible},
            total_infected: {label:'',value: outputs.infections},
            total_confirmed: {label:'',value:outputs.confirmed},
            total_fatalities: {label:'',value: outputs.deceased},
            total_tests: {label:'',value: outputs.tested}, 
            daily_test_avail: {label:'',value: outputs.testsAvailable},
            total_test_needed: {label:'',value: outputs.testsNeeded},

    
            real_R0: {label:'',value: real_R0},
            measured_R0: {label:'',value: measured_R0},
            days: {label:'',value: days},
        }
    }
    return results
}



