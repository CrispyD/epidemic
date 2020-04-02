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
const yellow2 = '##FFE082';

const grey = '#607D8B';
const grey2 = '#B0BEC5';

const teal = '#009688'
const teal2 = '#80CBC4';

const black ='#212121'
const black2 ='#212121'


const popLim = [0, 350e6]
const xlim = [10, 260]
  export const plotConfig = [
        {
            title: 'Total Cases and Fatalities',
            // subtitle: 'Confirmed cases depends significantly on how the numbers are reported, and the number of tests available.',
            scale: { type: 'logarithmic', },
            swapLog: true,
            ylim: popLim,
            xlim: xlim,
            lines:[
            {label: 'Susceptible', x: 'days',  y: 'total_susceptible', color: grey, source:'results'},
            {label: 'Infected', x: 'days',  y: 'total_infected', color: yellow, source:'results'},

            {label: 'Confirmed', x: 'days',  y: 'total_confirmed', color: blue, source:'results'},
            {label: 'Deaths', x: 'days',  y: 'total_fatalities', color: red, source:'results'},

            {label: 'Confirmed', x: 'days',  y: 'total_confirmed', color: blue2, source:'data'},
            {label: 'Deaths', x: 'days',  y: 'total_fatalities', color: red2, source:'data'},
        ],
    },
    {
        title: 'Daily Cases and Fatalities',
        // subtitle: 'Confirmed cases depends significantly on how the numbers are reported, and the number of tests available.',
        scale: { type: 'logarithmic', },
        swapLog: true,
        ylim: popLim,
        xlim: xlim,
        lines:[
            {label: 'Infected', x: 'days',  y: 'daily_infected', color: yellow, source:'results'},

            {label: 'Confirmed', x: 'days',  y: 'daily_test_pos', color: blue, source:'results'},
            {label: 'Deaths', x: 'days',  y: 'daily_fatalities', color: red, source:'results'},

            {label: 'Confirmed', x: 'days',  y: 'daily_test_positive', color: blue2, source:'data'},
            {label: 'Deaths', x: 'days',  y: 'daily_fatalities', color: red2, source:'data'},
        ],
    },
    {
        title: 'Daily Testing',
        subtitle: '',
        // 'The confirmed cases is often limited by testing and ' +
        // 'has little to do with the number of infections. Many un-infected people are also tested. ' + 
        // 'Only ~15% of test come back positive, so 6-7 tests are required for each confirmed case.',
        scale: { type: 'logarithmic', },
        swapLog: true,
        ylim: popLim,
        xlim: xlim,
        lines:[

            {label: 'Tests', x: 'days',  y: 'daily_test_avail',   color: green, source:'results'},
            {label: 'Confirmed', x: 'days',  y: 'daily_test_pos', color: blue, source:'results'},
            // {label: 'Pending Test',    x: 'days',  y: 'daily_test_pending', color: blue, source:'results'},
            {label: 'Needed Tests',      x: 'days',  y: 'daily_total_test_need',    color: purple, source:'results'},
            
            {label: 'Tests', x: 'days',  y: 'daily_test',          color: green2, source:'covidtracking'},
            {label: 'Confirmed',   x: 'days',  y: 'daily_test_positive', color: blue2, source:'covidtracking'},
            // {label: 'Pending Test',    x: 'days',  y: 'total_pending',       color: blue2, source:'covidtracking'},
 
        ],
    },
    {
        title: 'R0 - Reproduction Number',
        subtitle: 'The number of infections resulting from a single infection. If it is below one, the number of cases will reduce and the epidemic will end. ' + 
        'The "Infected" value is the actual replication in the model. The "Confirmed" value is calculated from modeled daily test results',// +
                // 'It is significanly effected by our individual behavior, which is why social distancing and hand washing are so important. '+ 
                // 'It can also be reduced by mass vaccination of the population. ' +
                // 'Withouth any intervention, it will drop below one naturally as the population becomes immune through infection.',
        ylim: [0, 6],
        xlim: xlim,
        lines:[
            {label: 'Infected', x: 'days',  y: 'real_R0', color: yellow, source:'results'},
            {label: 'Confirmed', x: 'days',  y: 'measured_R0', color: blue, source:'results'},
        ],
    },
  ]