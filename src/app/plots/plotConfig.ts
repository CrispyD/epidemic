const red = '#f44336';
const red2 ='#ef9a9a'

const green = '#4CAF50';
const green2 = '#A5D6A7'

const blue = '#3F51B5';
const blue2 = '#9FA8DA'

const purple = '#9C27B0';
const purple2 = '#CE93D8'

const orange = '#FF5722';
const orange2 = '#FFAB91'

const yellow = '#FFC107';
const yellow2 = '#FFE082';

const grey = '#607D8B';
const grey2 = '#B0BEC5';

const teal = '#009688'
const teal2 = '#80CBC4';

const black ='#212121'
const black2 ='#212121'

const popLim = [0, 350e6]
const xlim = [0, 244]
  export const plotConfig = [
        {
            title: 'Total Cases and Fatalities',
            label:'Cases and Deaths',
            description: 'The model is an extended <a href="https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology#The_SIR_model">Suceptible, Infected, Recovered (SIR) model</a>. ' + 
            'The number of new infections depends on; current infections, susceptible individuals, social mitigations, and the basic transmission rate R0.',
            sources:[{name:'model',hidden:false},{name:'data',hidden:false}],
            logScale: true,
            daily: true,
            ylim: popLim,
            xlim: xlim,
            lines:[
            {label: 'Susceptible', x: 'days',  y: 'total_susceptible', color: [grey,grey2],hidden:false},
            {label: 'Infected', x: 'days',  y: 'total_infected', color: [yellow,yellow2],hidden:false},
            {label: 'Confirmed', x: 'days',  y: 'total_confirmed', color: [blue,blue2],hidden:false},
            {label: 'Deaths', x: 'days',  y: 'total_fatalities', color: [red,red2],hidden:false},
        ],
    },
    {
        title: 'Daily Testing',
        label:'Tests',
        description: 'The number of confirmed cases is limited by available tests. The Minimum Tests Needed (Min. Need) is a rough estimate that assumes ~6-7 tests are needed to confirm each symptomatic case.',
        sources:[{name:'model',hidden:false},{name:'data',hidden:false}],
        logScale: true,
        daily: true,
        ylim: popLim,
        xlim: xlim,
        lines:[

            {label: 'Tests', x: 'days',  y: 'total_tests',   color: [green, green2],hidden:false},
            {label: 'Confirmed', x: 'days',  y: 'total_confirmed', color:  [blue,blue2],hidden:false},
            {label: 'Min. Need',      x: 'days',  y: 'total_test_needed',    color:  [purple,purple2]},
 
        ],
    },
    {
        title: 'R0 - Reproduction Number',
        label:'R - Transmission',
        description: 'R is the number of infections resulting from a single infection. If it is below one, the number of cases will reduce and the epidemic will end. ' + 
        'A direct calculation from confimed cases is misleading because of testing limitations.',
        // 'The "Infected" value is the actual replication in the model. The "Confirmed" value is calculated from modeled daily test simulation',// +
                // 'It is significanly effected by our individual behavior, which is why social distancing and hand washing are so important. '+ 
                // 'It can also be reduced by mass vaccination of the population. ' +
                // 'Withouth any intervention, it will drop below one naturally as the population becomes immune through infection.',
        sources:[{name:'model',hidden:false},{name:'data',hidden:false}],
        ylim: [0, 4],
        xlim: xlim,
        lines:[
            {label: 'Infected', x: 'days',  y: 'real_R0',   color: [yellow, yellow2],hidden:false},
            {label: 'Confirmed', x: 'days',  y: 'measured_R0', color:  [blue,blue2],hidden:false},
        ],
    },
  ]