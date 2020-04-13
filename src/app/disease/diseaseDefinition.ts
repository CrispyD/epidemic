
export interface DiseaseDefinition {
    label: string
    stages: string[],
    minDays    : number[],
    avgDays    : number[],
    treated    : number[],
    untreated  : number[],
    attributes : {
        contagious : boolean[],
        symptomatic: boolean[],
        hospital   : boolean[],
        ventalator : boolean[],
    }
}

export const covid19: DiseaseDefinition[] = [
    {
        label: 'asymptomatic',
        stages: ['incubation', 'contagious', 'contagious'],
        minDays    : [1, 2, 5],
        avgDays    : [2, 3, 5],
        treated    : [0, 0, 0],
        untreated  : [0, 0, 0],
        attributes : {
            contagious : [false, true, true],
            symptomatic: [false, false, false],
            hospital   : [false, false, false],
            ventalator : [false, false, false],
        }
    },
    {
        label: 'moderate',
        stages     : ['incubation', 'contagious', 'symptomatic'],
        minDays    : [1, 2, 5],
        avgDays    : [2, 3, 5],
        treated    : [0, 0, 0],
        untreated  : [0, 0, 0],
        attributes : {
            contagious : [false, true, true],
            symptomatic: [false, false, true],
            hospital   : [false, false, false],
            ventalator : [false, false, false],
        }
    },
    {
        label: 'severe',
        stages     : ['incubation', 'contagious', 'symptomatic', 'severe'],
        minDays    : [1, 2, 2, 7],
        avgDays    : [2, 3, 3, 14],
        treated    : [0, 0, 0, 0.05],
        untreated  : [0, 0, 0, 0.1],
        attributes : {
            contagious : [false, true, true, false],
            symptomatic: [false, false, true, true],
            hospital   : [false, false, true, true],
            ventalator : [false, false, false, true],
        }
    },
    {
        label: 'critical',
        stages  : ['incubation', 'contagious', 'symptomatic', 'critical'],
        minDays     : [1, 2, 5, 10],
        avgDays     : [2, 3, 3, 28],
        treated     : [0, 0, 0.0, 0.5],
        untreated   : [0, 0, 0.2, 0.9],
        attributes : {
            contagious  : [false,  true,  true, false],
            symptomatic : [false, false,  true, true],
            hospital    : [false, false,  true, true],
            ventalator  : [false, false, false, true],
        }
    }
]


