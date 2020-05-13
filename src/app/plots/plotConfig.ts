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
            description: 
            '<h3>Lines</h3>'+
            '<p><strong>Susceptible</strong> - Individuals that can be infected</p>'+
            '<p><strong>Infected</strong> - Number of infections</p>'+
            '<p><strong>Confirmed</strong> - Number of infected that have tested positive</p>' +
            '<p><strong>Deaths</strong> - Number of deaths</p>' +
            '<h3>Insights</h3>'+
            '<p>The model is an extended <a href="https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology#The_SIR_model">Suceptible, Infected, Recovered (SIR) model</a>. ' + 
            'The number of new infections depends on; current infections, susceptible individuals, social behavior, and the basic transmission number R0.</p>',
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
        description:
        '<h3>Lines</h3>'+
        '<p><strong>Tests</strong> - The number of tests available</p>'+
        '<p><strong>Confirmed</strong> - Number of infected that have tested positive. The number of confirmed cases is limited by available tests.</p>' + 
        '<p><strong>Min. Need</strong> - An estimate of minimum tests required to confirm all symptomatic cases. Assumes ~6-7 tests are needed to confirm each symptomatic case.</p>' + 
        '<h3>Insights</h3>'+
        '<p>Trends in confimed cases can be misleading. If there are too few tests, and testing is ramped up, confirmed cases can increase even when true infections are decreasing.</p>' + 
        '<p>Unfortunately, hospitalization and death rates appear to be the most reliable data, and they lag behind the true infection rate by several weeks.<p/>',
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
        label:'R - Reproduction Number',
        description: 
        '<h3>Lines</h3>'+
        '<p><strong>R - True</strong> - The true reproduction number. Cannot be directly measured in the real world.</p>'+
        '<p><strong>R - Confirmed</strong> - The calculated reproduction number from confirmed cases. It is misleading because of testing limitations.</p>'+
        '<h3>Insights</h3>'+
        '<p>R is the number of infections resulting from a single infection. If it is below one, the number of cases will reduce and the epidemic will end.</p>' + 
        '<p>R can be reduced through social behavior, like physical distancing and contact tracing. It will also reduce as the population becomes immune, either through infection or vaccination.</p>',
        // 'The "Infected" value is the actual replication in the model. The "Confirmed" value is calculated from modeled daily test simulation',// +
                // 'It is significanly effected by our individual behavior, which is why social distancing and hand washing are so important. '+ 
                // 'It can also be reduced by mass vaccination of the population. ' +
                // 'Withouth any intervention, it will drop below one naturally as the population becomes immune through infection.',
        sources:[{name:'model',hidden:false},{name:'data',hidden:false}],
        ylim: [0, 4],
        xlim: xlim,
        lines:[
            {label: 'R - true', x: 'days',  y: 'real_R0',   color: [yellow, yellow2],hidden:false},
            {label: 'R - confirmed', x: 'days',  y: 'measured_R0', color:  [blue,blue2],hidden:false},
        ],
    },
  ]