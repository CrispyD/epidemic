import * as aM from '../tools/arrayMath'
import { DataSet } from '../data/data-model'

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

    createState() { // Create an empty state vector. Used when initializing the sim. 
        let state = [];
        this.courses.forEach(course => {
            state = [...state, ...aM.zeros(3*course.n_states)]
        });
        return state
    }

    setState(state) { // distribute the state to the disease courses
        let start = 0
        let end = 0
        this.courses.forEach(course => {
            end += 3*course.n_states
            course.setState(state.slice(start,end))
            start = end 
        });
    }

    getState() { // collect the state from each of the disease courses
        let state=[]
        this.courses.forEach(course=>{
            state = [...state, ...course.getState()]
        })
        return state
    }

    getStateChange(day) { // calculate the state derivative
        let contagious = 0;
        let needTest_n = 0;
        let population = 0;
        let newInfections = 0;
        this.courses.forEach(course=>{
            contagious += course.getContagious() // total number of contagious
            needTest_n += aM.sum( course.getNeedTest() ) // total number of needed tests
            population += course.getPopulation() // total population
        })
        
        const transmissionRate = this.socialSpread(day) * contagious / population  // Disease Transmission

        const testsAvailable = this.testsAvailable(day) // how many tests are avalable
        let testingRate // percentage of untested-symptomatic that recieve a test
        if (needTest_n===0) { testingRate = 1} else {
            testingRate =  Math.min(this.testSuccess(day) * testsAvailable / (needTest_n)  ,1)
        }

        let dstate = [];
        let firstSymptoms = 0;
        this.courses.forEach(course => {

            // normal disease progression
            course.progression[0] = transmissionRate
            const dInfected = course.dailyProgression(course.infections)
            firstSymptoms += course.outputs.firstSymptoms // for output
            let dPending = course.dailyProgression(course.pendingTests) 
            let dConfirmed = course.dailyProgression(course.confirmedTests)

            newInfections -= dInfected[0] // for output
            
            // pending tests becoming confirmed
            const testDelayRate = 1/this.testDelay(day)
            let testUpdate = aM.multiply(course.pendingTests, testDelayRate) // test that become confirmed
            const dTestUpdate = course.dailyProgression(testUpdate) // confirmed test that progressed
            dPending = aM.subtract(dPending,testUpdate)
            dPending = aM.subtract(dPending,dTestUpdate)
            dConfirmed = aM.add(dConfirmed,testUpdate)
            dConfirmed = aM.add(dConfirmed,dTestUpdate)

            // new test become pending
            const needTest = course.getNeedTest()
            let newTests = aM.multiply(needTest,testingRate)
            const dNewTests = course.dailyProgression(newTests)
            dPending = aM.add(dPending,newTests)
            dPending = aM.add(dPending,dNewTests)

            dstate = [...dstate,...dInfected,...dPending,...dConfirmed]

        });

        // Outputs
        let hasHadSymptoms = 0
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
            let firstSymptomsIndex = course.symptomatic.findIndex(element=>element)
            if (firstSymptomsIndex != -1) {
                hasHadSymptoms += aM.sum(course.infections.slice(firstSymptomsIndex))
            }
            suseptible += course.infections[0]
            infections += aM.sum(course.infections.slice(1))
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
            testsNeeded: firstSymptoms / this.testSuccess(day),
            firstSymptoms: firstSymptoms,
            newInfections: newInfections,
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

    outputs: {[name:string]:number} = {}

    constructor(
        minDays: number[], avgDays: number[], 
        treatedMortality: number[], untreatedMortality: number[], 
        attributes) {
        
        // set first step of progression (from suceptible to exposed or infected)
        this.progression        = [0] // progression describes disease transitions, e.g. from suceptible to infected to resolved
        this.treatedMortality   = [0] // mortality rate with appropriate treatement (only this one is used currently)
        this.untreatedMortality = [0] // mortality rate without treatement (not implemented)
        for (const key of Object.keys(attributes)) { this[key] = [false] } // initialize disease attributes

        // set progression for additional stages
        minDays.forEach((_element,index) => {

            this.progression = this.progression.concat(
                aM.multiply( aM.ones(minDays[index]), minDays[index] / avgDays[index] )
                )

            this.treatedMortality = this.treatedMortality.concat(
                aM.subtract( 1,
                    aM.multiply( aM.ones(minDays[index]),
                        (1-treatedMortality[index]) ** (1 / avgDays[index]) )
                )
            )
        
            this.untreatedMortality = this.untreatedMortality.concat(
                aM.subtract( 1,
                    aM.multiply( aM.ones(minDays[index]),
                        (1-untreatedMortality[index]) ** (1 / minDays[index]) )
                )
            )

            for (const [key, value] of Object.entries(attributes)) {
                this[key] = this[key].concat(
                    value[index] ? aM.trueArray( minDays[index] ) : aM.falseArray( minDays[index])
                ) 
            }

        })
        
        // append two final stages for recovered and deceased
        this.progression = this.progression.concat([0,0])
        this.treatedMortality = this.treatedMortality.concat([0,0])
        this.untreatedMortality = this.untreatedMortality.concat([0,0])
        for (const key of Object.keys(attributes)) {
            this[key] = this[key].concat([false,false]) 
        }
        this.n_states = this.progression.length
    }

    createState() {
        return aM.zeros(3*this.n_states) // 3x because [infections, pendingTest, confirmedTest]
    }

    setState(state){ // distribute state
        this.infections     = state.slice(0*this.n_states,1*this.n_states)
        this.pendingTests   = state.slice(1*this.n_states,2*this.n_states)
        this.confirmedTests = state.slice(2*this.n_states,3*this.n_states)
    }

    getState() { // collect and return state
        return [...this.infections, ...this.pendingTests, ...this.confirmedTests]
    }

    dailyProgression(state) { // progression through the disease course
        // used to progress infections, but also pending and confirmed tests.

        // state derivative
        let dState = aM.zeros(this.n_states)

        // mortality
        const mortality = this.treatedMortality // TODO: shold depend on available treatment
        const deaths = aM.multiply(mortality, state)
        
        // disease progression
        dState = aM.subtract(dState,deaths) 
        dState[dState.length-1] += aM.sum(deaths)

        const stateDeathsRemoved = aM.subtract(state,deaths) 
        let progression = aM.multiply(this.progression, stateDeathsRemoved )
        
        // apply progression to state change
        aM.setSlice(dState,
            aM.add(      dState.slice(1,-1),  progression.slice(0,-2)),
            1,-1)
        aM.setSlice(dState,
            aM.subtract( dState.slice(0,-2), progression.slice(0,-2) ),
            0,-2)        

        // quick output. Bit of a hack, should be cleaned up.
        let firstSymptomsIndex = this.symptomatic.findIndex(element=>element)
        if (firstSymptomsIndex != -1) {
            this.outputs['firstSymptoms'] = progression[firstSymptomsIndex-1]
        } else {this.outputs['firstSymptoms'] = 0}

        // return state derivative
        return dState
    }

    getContagious() { // how many are contagious?
        return aM.sum(aM.getMask(this.infections,this.contagious))
    }

    getSymptomatic() { // how many are symptomatic?
        return aM.sum(aM.getMask(this.infections,this.symptomatic))
    }

    getPopulation() { // total population excluding the deceased
        return aM.sum(this.infections.slice(0,-1)) 
    }

    getNeedTest() { // how many need tests? (if symptomatic, and not pending or confirmed)
        let needTest = aM.subtract(aM.subtract(this.infections, this.pendingTests), this.confirmedTests)
        aM.setMask(needTest,0,aM.not(this.symptomatic))
        return aM.maximum(needTest,0) 
        // "maximum" shouldn't be needed, but prevents glitching when everythign drops near zero.
        // There might be an error in how pending and confirmed tests are integrated.
    }
 
    // getNeedHospital() { 
    //     return aM.sum(aM.getMask(this.infections,this.needHospital))
    // }

    // getNeedVentalator() {
    //     return aM.sum(aM.getMask(this.infections,this.needVentalator))
    // }
    
}

export function initializeDiseseCourses(diseaseDefinition) {
    
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

    const step = 0.5 // unfortunately, the solution is sensitve to step size. Likely due to discrete progression steps.
    const days = aM.range(simConfig.dayOffset.value,simConfig.dayOffset.value + simConfig.duration.value,step)
    
    disease.setState(disease.createState()) // initialize disease state
    
    // set suceptible population for each disease course
    const courseProportions = [simConfig.asymptomatic.value, simConfig.moderate.value, simConfig.severe.value, simConfig.critical.value]
    disease.courses.forEach((course,index) => {
        course.infections[0] = (simConfig.population.value - simConfig.initial_infection.value) * courseProportions[index]
    })
    // set initial infection (hard coded moderate case)
    disease.courses[1].infections[1] = simConfig.initial_infection.value
    
    // initialize outputs object
    disease.getStateChange(days[0])
    const outputs: {[name:string]:number[]} = {}
    for(const key of Object.keys(disease.outputs) ){
        outputs[key] = []
    };

    // initialzie array of state vectors
    const state = [disease.getState()]

    // numerical integration
    for (const i of aM.range(0,days.length)) {
        disease.setState(state[i]) // set state
        const stateChange = disease.getStateChange(days[i]) // calculate state derivative
        state.push( // append updated state
                aM.add(state[i], aM.multiply(stateChange,step)),
            )

        // store outputs
        for(const [key, value] of Object.entries(disease.outputs) ){
            outputs[key].push(value)
        };
        
    }

    // Post Calculations
    let haveBeenContagious = 0
    disease.courses.forEach(course => {
        if( aM.any(course.contagious) ) {
            const initialContagiousIndex = course.contagious.findIndex(element=>element)
            haveBeenContagious += aM.sum(course.infections.slice(initialContagiousIndex))
        }
        
    });
    const contagiousDurration = aM.sum(outputs.contagious) / haveBeenContagious * step
    const real_R0 = aM.multiply( aM.divide(outputs.newInfections,outputs.contagious), contagiousDurration)

    const daily_test_pos = ([0]).concat(aM.diff(outputs.confirmed)) 
    const measured_R0 = aM.multiply( aM.divide(daily_test_pos,outputs.activeConfirmed), contagiousDurration) // should use a measured dissease durration?

    const total_tests = aM.multiply( aM.cumsum(outputs.testsAvailable) , step)
    const cumulativetestNeed = aM.multiply(  aM.cumsum(outputs.testsNeeded) , step)

    // Return results
    const results : DataSet = {
        label:'Model',
        channels:{
            total_susceptible: {label:'',value: outputs.suseptible},
            total_infected: {label:'',value: outputs.infections},
            total_confirmed: {label:'',value:outputs.confirmed},
            total_fatalities: {label:'',value: outputs.deceased},
            total_tests: {label:'',value: total_tests}, 
            daily_test_avail: {label:'',value: outputs.testsAvailable},
            total_test_needed: {label:'',value: cumulativetestNeed},
            real_R0: {label:'',value: real_R0},
            measured_R0: {label:'',value: measured_R0},
            days: {label:'',value: days},
        }
    }

    return results
}



