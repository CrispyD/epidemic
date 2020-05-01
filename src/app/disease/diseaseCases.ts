
const duration = 200;

function displayPow10(x) {return Math.pow(10,x)}
const af = displayPow10
export const optimistic = {
  label: "Large Effect",
  simConfig: {
    duration: { value: duration, step: 1, round: 0 },
    population: { value: 330e6, step: 1e6, round: -6 },
    initial_infection: { value: 1, step: 1, round: 0 },
    dayOffset: { value: 6, step: 1, round: 0 },
    R0: { value: 2.9, min: 0, max: 5, step: 0.1, round: 1 },
    asymptomatic: { value: 0.2, min: 0, max: 0.7, step: 0.01, round: 2 },
    moderate: { value: 0.73, min: 0.0, max: 1.0, step: 0.01, round: 2 },
    severe: { value: 0.05, min: 0.0, max: 0.2, step: 0.01, round: 2 },
    critical: { value: 0.02, min: 0.0, max: 0.1, step: 0.01, round: 2 },
  },
  controls : {
    social: {
      label: 'social',
      values: [
        { x: { value:  70 }, y: { value: 1.0 } },
        { x: { value: 100 }, y: { value: 0.1 } },
        { x: { value: 152 }, y: { value: 0.1 } },
        { x: { value: 182 }, y: { value: 0.25 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 1, step: 0.05 },
    },

    tests: {
      label: 'tests',
      values: [
        { x: { value: 50 }, y: { value: 0.8 } },
        { x: { value: 70 }, y: { value: 4.0 } },
        { x: { value: 88 }, y: { value: 5.3 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 6, step: 0.1, axisFormat: 'pow10' },
    },
  
    testDelay: {
      values: [
        { x: { value: 70 }, y: { value: 5 } },
        { x: { value: 152 }, y: { value: 5 } },
      ],
      x: { min: 0, max: 200, step: 1 },
      y: { min: 0, max: 10, step: 0.5  },
    },
  }
};
export const moderate = {
  label: "Moderate Effect",
  simConfig: {
    duration: { value: duration, step: 1, round: 0 },
    population: { value: 330e6, step: 1e6, round: -6 },
    initial_infection: { value: 1, step: 1, round: 0 },
    dayOffset: { value: 6, step: 1, round: 0 },
    R0: { value: 2.9, min: 0, max: 5, step: 0.1, round: 1 },
    asymptomatic: { value: 0.2, min: 0, max: 0.7, step: 0.01, round: 2 },
    moderate: { value: 0.73, min: 0.0, max: 1.0, step: 0.01, round: 2 },
    severe: { value: 0.05, min: 0.0, max: 0.2, step: 0.01, round: 2 },
    critical: { value: 0.02, min: 0.0, max: 0.1, step: 0.01, round: 2 },
  },
  controls : {
    social: {
      label: 'social',
      values: [
        { x: { value:  70 }, y: { value: 1.0 } },
        { x: { value: 103 }, y: { value: 0.15 } },
        { x: { value: 152 }, y: { value: 0.15 } },
        { x: { value: 182 }, y: { value: 0.25 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 1, step: 0.05 },
    },

    tests: {
      label: 'tests',
      values: [
        { x: { value: 50 }, y: { value: 0.8 } },
        { x: { value: 70 }, y: { value: 4.0 } },
        { x: { value: 88 }, y: { value: 5.3 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 6, step: 0.1, axisFormat: 'pow10' },
    },
  
    testDelay: {
      values: [
        { x: { value: 70 }, y: { value: 5 } },
        { x: { value: 152 }, y: { value: 5 } },
      ],
      x: { min: 0, max: 200, step: 1 },
      y: { min: 0, max: 10, step: 0.5  },
    },
  }
};

export const pessimistic = {
  label: "Small Effect",
  simConfig: {
    duration: { value: duration, step: 1, round: 0 },
    population: { value: 330e6, step: 1e6, round: -6 },
    initial_infection: { value: 1, step: 1, round: 0 },
    dayOffset: { value: 6, step: 1, round: 0 },
    R0: { value: 2.9, min: 0, max: 5, step: 0.1, round: 1 },
    asymptomatic: { value: 0.2, min: 0, max: 0.7, step: 0.01, round: 2 },
    moderate: { value: 0.73, min: 0.0, max: 1.0, step: 0.01, round: 2 },
    severe: { value: 0.05, min: 0.0, max: 0.2, step: 0.01, round: 2 },
    critical: { value: 0.02, min: 0.0, max: 0.1, step: 0.01, round: 2 },
  },
  controls : {
    social: {
      label: 'social',
      values: [
        { x: { value:  70 }, y: { value: 1.0 } },
        { x: { value: 106 }, y: { value: 0.2 } },
        { x: { value: 152 }, y: { value: 0.2 } },
        { x: { value: 182 }, y: { value: 0.25 } },
      ],
      x: { min: 0.0, max: 365, step: 1 },
      y: { min: 0.0, max: 1, step: 0.05 },
    },

    tests: {
      label: 'tests',
      values: [
        { x: { value: 50 }, y: { value: 0.8 } },
        { x: { value: 70 }, y: { value: 4.0 } },
        { x: { value: 88 }, y: { value: 5.3 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 6, step: 0.1, axisFormat: 'pow10' },
    },
  
    testDelay: {
      values: [
        { x: { value: 70 }, y: { value: 5 } },
        { x: { value: 152 }, y: { value: 5 } },
      ],
      x: { min: 0, max: 200, step: 1 },
      y: { min: 0, max: 10, step: 0.5  },
    },
  }
};

export const noAction = {
  label: "No Action",
  simConfig: {
    duration: { value: duration, step: 1, round: 0 },
    population: { value: 330e6, step: 1e6, round: -6 },
    initial_infection: { value: 1, step: 1, round: 0 },
    dayOffset: { value: 6, step: 1, round: 0 },
    R0: { value: 2.9, min: 0, max: 5, step: 0.1, round: 1 },
    asymptomatic: { value: 0.2, min: 0, max: 0.7, step: 0.01, round: 2 },
    moderate: { value: 0.73, min: 0.0, max: 1.0, step: 0.01, round: 2 },
    severe: { value: 0.05, min: 0.0, max: 0.2, step: 0.01, round: 2 },
    critical: { value: 0.02, min: 0.0, max: 0.1, step: 0.01, round: 2 },
  },
  controls : {
    social: {
      label: 'social',
      values: [
        { x: { value:  70 }, y: { value: 1.0 } },
        { x: { value: 106 }, y: { value: 1.0 } },
        { x: { value: 152 }, y: { value: 1.0 } },
        { x: { value: 182 }, y: { value: 1.0 } },
      ],
      x: { min: 0.0, max: 365, step: 1 },
      y: { min: 0.0, max: 1, step: 0.05 },
    },

    tests: {
      label: 'tests',
      values: [
        { x: { value: 50 }, y: { value: 0.8 } },
        { x: { value: 70 }, y: { value: 4.0 } },
        { x: { value: 88 }, y: { value: 5.3 } },
      ],
      x: { min: 0, max: 365, step: 1 },
      y: { min: 0, max: 6, step: 0.1, axisFormat: 'pow10' },
    },
  
    testDelay: {
      values: [
        { x: { value: 70 }, y: { value: 5 } },
        { x: { value: 152 }, y: { value: 5 } },
      ],
      x: { min: 0, max: 200, step: 1 },
      y: { min: 0, max: 10, step: 0.5  },
    },
  }
};