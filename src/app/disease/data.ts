import * as aM from '../arrayMath'

export const data = {
    country: 'US',
    date : ['1/22/20','1/23/20','1/24/20','1/25/20','1/26/20','1/27/20','1/28/20','1/29/20','1/30/20','1/31/20','2/1/20','2/2/20','2/3/20','2/4/20','2/5/20','2/6/20','2/7/20','2/8/20','2/9/20','2/10/20','2/11/20','2/12/20','2/13/20','2/14/20','2/15/20','2/16/20','2/17/20','2/18/20','2/19/20','2/20/20','2/21/20','2/22/20','2/23/20','2/24/20','2/25/20','2/26/20','2/27/20','2/28/20','2/29/20','3/1/20','3/2/20','3/3/20','3/4/20','3/5/20','3/6/20','3/7/20','3/8/20','3/9/20','3/10/20','3/11/20','3/12/20','3/13/20','3/14/20','3/15/20','3/16/20','3/17/20','3/18/20','3/19/20','3/20/20','3/21/20','3/22/20','3/23/20','3/24/20','3/25/20','3/26/20','3/27/20','3/28/20','3/29/20','3/30/20'],
    total_fatalities: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,6,7,11,12,14,17,21,22,28,36,40,47,54,63,85,108,118,200,244,307,417,557,706,942,1209,1581,2026,2467,2978],
    total_confirmed:  [1,1,2,2,5,5,5,5,5,7,8,8,11,11,11,11,11,11,11,11,12,12,13,13,13,13,13,13,13,13,15,15,15,51,51,57,58,60,68,74,98,118,149,217,262,402,518,583,959,1281,1663,2179,2727,3499,4632,6421,7783,13677,19100,25489,33276,43847,53740,65778,83836,101657,121478,140886,161807],
}

data['daily_test_positive'] = ([0]).concat( aM.diff(data['total_confirmed'] ) )
data['daily_fatalities'] = ([0]).concat( aM.diff(data['total_fatalities'] ) )

export const test = {
    dateNum:[20200329,    20200328,    20200327,    20200326,    20200325,    20200324,    20200323,    20200322,    20200321,    20200320,    20200319,    20200318,    20200317,    20200316,    20200315,    20200314,    20200313,    20200312,    20200311,    20200310,    20200309,    20200308,    20200307,    20200306,    20200305,    20200304].reverse(),
    total_fatalities:[2428,        1965,        1530,        1163,        900,        675,        471,        398,        272,        219,        160,        112,        90,        71,        60,        49,        39,        36,        27,    null,    null,    null,    null,    null,    null,    null].reverse(),
    total_confirmed:[139061,        118234,        99413,        80735,        63928,        51954,        42152,        31879,        23197,        17033,        11719,        7730,        5723,        4019,        3173,        2450,        1922,        1315,        1053,        778,        584,        417,        341,        223,        176,        118].reverse(),
    total_tests:[896900,        801416,        686727,        579589,        472767,        359145,        294044,        228184,        182583,        138516,        103863,        76493,        55014,        41814,        27966,        20788,        16665,        10029,        7686,        5054,        4264,        3099,        2752,        2252,        1326,        969].reverse(),
    total_pending: [65549,        65712,        60094,        60251,        51235,        14433,        14571,        2842,        3477,        3336,        3025,        2538,        1687,        1691,        2242,        1236,        1130,        673,        563,        469,        313,        347,        602,        458,        197,        103].reverse(),
}