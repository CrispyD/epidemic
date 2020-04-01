
import * as aM from '../arrayMath'


function makeCourse(courseDef, sim_duration) {
    const masksLabels = ['contagious', 'symptomatic','hospital','ventalator']
    const course = {}
    for (const label of masksLabels) {
        course[label] = [false]
    }

    course['progression'] = []
    course['treated'] = []
    course['untreated'] = []
    for(var i = 0; i < courseDef['minDays'].length; i++){
        
        course['progression'] = course['progression'].concat(
            aM.multiply(
                aM.ones(courseDef['minDays'][i]), 
                courseDef['minDays'][i] / courseDef['avgDays'][i]
                )
            )

        course['treated'] = course['treated'].concat(
            aM.subtract( 1,
                aM.multiply(
                    aM.ones(courseDef['minDays'][i]),
                    (1-courseDef['treated'][i]) ** (1 / courseDef['avgDays'][i]) )
                )
            )

        course['untreated'] = course['untreated'].concat(
            aM.multiply(
                aM.ones(courseDef['minDays'][i]),
                Math.pow(
                    courseDef['untreated'][i],
                    (1 / courseDef['avgDays'][i]) 
                    )
                )
            )

        for (const label of masksLabels){
            course[label] = course[label].concat( 
                courseDef[label][i] ? 
                    aM.trueArray( courseDef['minDays'][i] ) : 
                    aM.falseArray( courseDef['minDays'][i] )
                 )
        }
    };

    for (const label of masksLabels) {
        course[label] = course[label].concat( [false] )// dtype=bool
    }

    const disease_steps = course['progression'].length + 2 // +2 for suseptible and resolved
    course['state']     = aM.repeat(aM.zeros(disease_steps), sim_duration) 
    course['pending'] = aM.repeat(aM.zeros(disease_steps), sim_duration) 
    course['confirmed'] = aM.repeat(aM.zeros(disease_steps), sim_duration) 

    return course
}

export function initializeDiseseCourses(simConfig, diseaseDefinition) {
    
    const sim_duration = simConfig.duration
    const course_distribution = [
        simConfig.asymptomatic, 
        simConfig.moderate, 
        simConfig.severe, 
        simConfig.critical]

    // initialize population and infection
    const diseaseCourses = []
    for (const courseDef of diseaseDefinition) {
        diseaseCourses.push( makeCourse(courseDef, sim_duration) )
    }

    diseaseCourses.forEach( (course,i) => {
        course['state'][0][0] =  (simConfig.population - simConfig.initial_infection)  * course_distribution[i] 
    })

    diseaseCourses[1]['state'][0][1] = simConfig.initial_infection
    

    return diseaseCourses
}

export function simulateDisease(simConfig, diseaseCourses, social_spread, 
    tests_available, test_delay, tests_success, contagiousDurration) {
        
    // initialize outputs
    const daily_infections = aM.zeros(simConfig.duration)
    const total_susceptible = aM.zeros(simConfig.duration)
    const total_resolved = aM.zeros(simConfig.duration)
    const daily_infected = aM.zeros(simConfig.duration)
    const total_contagious = aM.zeros(simConfig.duration)
    const daily_fatalities = aM.zeros(simConfig.duration)
    const total_pending = aM.zeros(simConfig.duration)
    const total_confirmed = aM.zeros(simConfig.duration)
    const active_confirmed = aM.zeros(simConfig.duration)
    const daily_total_test_need = aM.zeros(simConfig.duration)
    const daily_infected_test_need = aM.zeros(simConfig.duration)
    const daily_test_avail = aM.zeros(simConfig.duration)
   
    
    const days = aM.range(simConfig.dayOffset,simConfig.dayOffset + simConfig.duration)
    
    let test_pos_rate
    let test_delay_rate
    for (const i of aM.range(0,simConfig.duration)) {
        const day = days[i]
        //// Infection
        for (const course of diseaseCourses) {
            total_susceptible[i] += course['state'][i][0]
            total_resolved[i] += course['state'][i].slice(-1)[0]
            daily_infected[i] += aM.sum(course['state'][i].slice(1,-1))

            total_contagious[i] += aM.sum( aM.getMask( course['state'][i], course['contagious'] ) )
            total_confirmed[i] += aM.sum(course['confirmed'][i])
            total_pending[i] += aM.sum(course['pending'][i])
            active_confirmed[i] += aM.sum( course['confirmed'][i].slice(1,-1) )

            daily_infected_test_need[i] += aM.sum(aM.subtract(
                aM.getMask( course['state'][i],course['symptomatic']),
                aM.add(
                    aM.getMask( course['pending'][i], course['symptomatic']),
                    aM.getMask( course['confirmed'][i], course['symptomatic'])
                ) ))
                
            }
            daily_test_avail[i] = tests_available(day) 
            daily_total_test_need[i] = daily_infected_test_need[i] / tests_success(day)

        if (day == 70) {
            const stop = true
         }
        
        const susceptible_progression = social_spread(day) * total_contagious[i] / simConfig.population 
        
        //// testing
        if (daily_infected_test_need[i] == 0) {test_pos_rate = 1} // no one needs a test, so don't divide by zero
        else {
            test_pos_rate = aM.minimum(daily_test_avail[i] * tests_success(day)  / daily_infected_test_need[i],1)
        } 

        if (day<days.slice(-1)[0]) {
            for (const course of diseaseCourses) {
    
                if (aM.any(course['symptomatic'])) {
                    const need_tests = aM.subtract( course['state'][i],
                        aM.add( course['pending'][i],  course['confirmed'][i] ))
                    aM.setMask(need_tests,0,aM.not(course['symptomatic']))

                    const delay = test_delay(day)
                    let new_pending 
                    let new_positives
                    if (delay <= 0) { // no delay
                        new_positives = aM.multiply(need_tests , test_pos_rate )
                        new_pending = aM.zeros(new_positives.let)
                        course['confirmed'][i] = aM.add(course['confirmed'][i],new_positives)

                    } else if ( delay > 0 && delay <= 1 ) {
                        const test_delay_ratio = delay
                        test_delay_rate = 1

                        new_positives = aM.add(
                            aM.multiply(need_tests , test_pos_rate * (1-test_delay_ratio) ),
                            aM.multiply(course['pending'][i] , test_delay_rate ) 
                            )

                        new_pending = aM.subtract(
                            aM.multiply(need_tests , test_pos_rate * test_delay_ratio) ,
                            aM.multiply(course['pending'][i] , test_delay_rate ) 
                            )

                        course['confirmed'][i] = aM.add(course['confirmed'][i],new_positives)
                        course['pending'][i] = aM.add(course['pending'][i], new_pending)

                    } else {
                        test_delay_rate = 1 - ( 0.1 ** ( 1 / (delay - 1) ) )
                        new_pending = aM.multiply(need_tests , test_pos_rate ) // only symptomatic
                        new_positives = aM.multiply(course['pending'][i] , test_delay_rate ) // all
                        course['pending'][i] = aM.add(course['pending'][i], aM.subtract(new_pending,new_positives))
                        course['confirmed'][i] = aM.add(course['confirmed'][i],new_positives)
                    } 
                }
            
                //// fatalities 
                const todays_fatalities = aM.multiply(course['state'][i].slice(1,-1), course['treated'])
                aM.setSlice(course['state'][i],
                    aM.subtract(course['state'][i].slice(1,-1), todays_fatalities)
                    ,1,-1) 
                course['state'][i][-1] += aM.sum(todays_fatalities)
                daily_fatalities[i] += aM.sum(todays_fatalities)
            
                const confirmed_fatalities = aM.multiply(course['confirmed'][i].slice(1,-1), course['treated'])
                aM.setSlice(course['confirmed'][i],
                    aM.subtract(course['confirmed'][i].slice(1,-1), confirmed_fatalities)
                    ,1,-1) 
                course['confirmed'][i][-1] += aM.sum(confirmed_fatalities)

                const pending_fatalities = aM.multiply(course['pending'][i].slice(1,-1), course['treated'])
                aM.setSlice(course['pending'][i],
                    aM.subtract(course['pending'][i].slice(1,-1), pending_fatalities)
                    ,1,-1) 
                course['pending'][i][-1] += aM.sum(pending_fatalities)   


                //// update state
                const todays_progression = [susceptible_progression].concat(course['progression']) 
                const state_change = aM.multiply( course['state'][i].slice(0,-1) , todays_progression)
                course['state'][i+1]     = [...course['state'][i]]
    
                aM.setSlice(course['state'][i+1],
                    aM.add(course['state'][i+1].slice(1), state_change)
                    ,1) 
    
                aM.setSlice(course['state'][i+1],
                    aM.subtract(course['state'][i+1].slice(0,-1), state_change)
                    ,0,-1) 

                daily_infections[i] += state_change[0]

                //// update testing
                const confirmed_change = aM.multiply(course['confirmed'][i].slice(0,-1), todays_progression)
                course['confirmed'][i+1]     = [...course['confirmed'][i]]
                
                aM.setSlice(course['confirmed'][i+1],
                aM.add(course['confirmed'][i+1].slice(1), confirmed_change)
                ,1) 
                
                aM.setSlice(course['confirmed'][i+1],
                    aM.subtract(course['confirmed'][i+1].slice(0,-1), confirmed_change)
                    ,0,-1) 


                const pending_change = aM.multiply(course['pending'][i].slice(0,-1), todays_progression)
                course['pending'][i+1]     = [...course['pending'][i]]
                
                aM.setSlice(course['pending'][i+1],
                aM.add(course['pending'][i+1].slice(1), pending_change)
                ,1) 
                
                aM.setSlice(course['pending'][i+1],
                    aM.subtract(course['pending'][i+1].slice(0,-1), pending_change)
                    ,0,-1) 

            }
        }

        
    }
    const total_infected = aM.cumsum(daily_infections)

    const daily_test_pos = aM.diff( ([0]).concat( total_confirmed ) )
    const real_R0 = aM.multiply( aM.divide(daily_infections,total_contagious), contagiousDurration)
    const measured_R0 = aM.multiply( aM.divide(daily_test_pos,active_confirmed), contagiousDurration) // should use a measured dissease durration?


    aM.setMask(real_R0,0,aM.isNaN(real_R0))
    aM.setMask(measured_R0,0,aM.isNaN(measured_R0))
    const daily_test_pending =  aM.diff( ([0]).concat( total_pending ) )

    const results = {
        diseaseCourses: diseaseCourses,

        total_susceptible: total_susceptible,
        total_resolved: total_resolved,
        total_infected: total_infected,
        daily_infected: daily_infected,
        daily_infections: daily_infections,

        total_contagious:total_contagious,
        total_confirmed:total_confirmed,
        active_confirmed:active_confirmed,

        daily_fatalities: daily_fatalities,
        total_fatalities: aM.cumsum(daily_fatalities),

        daily_infected_test_need: daily_infected_test_need,
        daily_total_test_need: daily_total_test_need,
        daily_test_avail: daily_test_avail,
        daily_test_pending: daily_test_pending,
        daily_test_pos: aM.diff( ([0]).concat( total_confirmed ) ),
        total_test_pending: total_pending,
        daily_untested: aM.subtract(daily_infected_test_need,aM.add(daily_test_pos, daily_test_pending)),

        real_R0: real_R0,
        measured_R0: measured_R0,
        days: days
    }
    return results
}



