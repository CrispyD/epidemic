import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";

import * as aM from "../tools/arrayMath";

const jan1 = new Date("1/1/2020");

@Component({
  selector: "app-plots",
  templateUrl: "./plots.component.html",
  styleUrls: ["./plots.component.scss"],
})
export class PlotsComponent implements OnInit {
  // options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = false;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = "day";
  yAxisLabel: string = "social";
  timeline: boolean = false;
  tooltipDisabled: boolean = false;
  activateDrag: boolean = true;
  yAxisTickFormatting: any;
  colorScheme;

  xMax;
  xMin;
  yMin;
  yMax;
  yStep;

  linLogButton = "Linear Axes";

  config;
  sources;
  plotData;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.config.subscribe((config) => {
      this.config = config;
      this.updatePlotData();
    });
    this.dataService.dataSources.subscribe((sources) => {
      this.sources = sources;
      this.updatePlotData();
    });

    this.xMin = 0;
    this.xMax = 360;

    this.yMin = 0;
    this.yMax = 350e6;
  }

  hideLine(line) {
    console.log(line);
    this.dataService.hideLine(line);
  }

  swapLogarithmic() {
    this.config.plot.plots.forEach((element) => {
      if (element.swapLog) {
        if (element.scale.type === "logarithmic") {
          element.scale.type = "linear";
          element.ylim = undefined;
          this.linLogButton = "Logarithmic Axes";
        } else {
          element.scale.type = "logarithmic";
          element.ylim = [0, 350e6];
          this.linLogButton = "Linear Axes";
        }
      }
    });
    this.updatePlotData();
  }

  updatePlotData() {
    if (this.config.plot.plots && this.sources) {
      this.plotData = JSON.parse(JSON.stringify(this.config.plot.plots));
      let pCount = 0;
      for (const plot of this.config.plot.plots) {
        let sCount = 0;
        const lines = [];
        const colors = [];

        if (this.config.plot.logScale && plot.logScale) {
          this.plotData[pCount].ylim[0] = Math.log10(
            Math.max(this.plotData[pCount].ylim[0], 10)
          );
          this.plotData[pCount].ylim[1] = Math.log10(
            this.plotData[pCount].ylim[1]
          );
          this.plotData[pCount].formatData = (x) =>
            postFix_kMBT(Math.pow(10, x),1);
        } else {
          this.plotData[pCount].ylim[0] = undefined;
          this.plotData[pCount].ylim[1] = undefined;
          if (plot.logScale) {
            this.plotData[pCount].formatData = (x) => postFix_kMBT(x,1);
          } else {
            this.plotData[pCount].formatData = (x) => postFix_kMBT(x,10);
          }
        }

        for (const source of plot.sources) {
          for (const line of plot.lines) {
            if (
              this.sources[source.name] &&
              this.sources[source.name].channels[line.x] &&
              this.sources[source.name].channels[line.y] &&
              !source.hidden &&
              !line.hidden
            ) {
              let x = this.sources[source.name].channels[line.x].value;
              let y = this.sources[source.name].channels[line.y].value;

              if (this.config.plot.daily && plot.daily) {
                y = total2daily(x, y);
              }

              const series = x.reduce((acc, item, index, array) => {
                if (isDefinedNum(x[index]) && isDefinedNum(y[index])) {
                  const xdate = new Date(jan1);
                  xdate.setDate(xdate.getDate() + x[index]);

                  if (this.config.plot.logScale && plot.logScale) {
                    if (y[index] > 0) {
                      const formatted = {
                        name: new Date(xdate),
                        value: Math.log10(y[index]),
                      };
                      acc.push(formatted);
                    }
                  } else {
                    const formatted = {
                      name: new Date(xdate),
                      value: y[index],
                    };
                    acc.push(formatted);
                  }
                }
                return acc;
              }, []);

              lines.push({
                name: source.name + " - " + line.label,
                series: series,
              });
              colors.push(line.color[sCount]);
            }
          }
          sCount++;
        }

        this.plotData[pCount].lines = lines;
        this.plotData[pCount].colors = { domain: colors };
        pCount++;
      }
    }
    console.log(this.plotData);
  }

  getSeriesToolTipText(tooltipItem: any, format): string {
    let result: string = "";
    if (tooltipItem.series !== undefined) {
      result += tooltipItem.series;
    } else {
      result += "???";
    }
    result += ": ";
    if (tooltipItem.value !== undefined) {
      // result += tooltipItem.value.toLocaleString();
      result += format(tooltipItem.value);
    }
    if (tooltipItem.min !== undefined || tooltipItem.max !== undefined) {
      result += " (";
      if (tooltipItem.min !== undefined) {
        if (tooltipItem.max === undefined) {
          result += "≥";
        }
        result += tooltipItem.min.toLocaleString();
        if (tooltipItem.max !== undefined) {
          result += " - ";
        }
      } else if (tooltipItem.max !== undefined) {
        result += "≤";
      }
      if (tooltipItem.max !== undefined) {
        result += tooltipItem.max.toLocaleString();
      }
      result += ")";
    }
    return result;
  }

  identifierIndex = (index: number, item: any) => index;
}

function total2daily(days, total) {
  let day = aM.diff(days);
  day = day.slice(0).concat(day);
  const daily = [0].concat(aM.diff(total));
  return aM.divide(daily, day);
}

function postFix_kMBT(x,scale) {
  let sign = "";
  let value;
  if (x < 0) {
    sign = "-";
    x = -x;
  }
  if (x >= 0 && x < 1) {
    value = Math.round(x*scale)/scale + " ";
  }
  if (x >= 1 && x < 1e3) {
    value = Math.round(x*scale)/scale + " ";
  }
  if (x >= 1e3 && x < 1e6) {
    value = Math.round(x*scale / 1e3) / scale + "k";
  }
  if (x >= 1e6 && x < 1e9) {
    value = Math.round(x*scale / 1e6) / scale + "M";
  }
  if (x >= 1e9 && x < 1e12) {
    value = Math.round(x*scale / 1e9) / scale + "B";
  }
  if (x >= 1e12 && x < 1e15) {
    value = Math.round(x*scale / 1e12) / scale + "T";
  }
  return sign + value;
}

function isDefined(x) {
  return typeof x != "undefined";
}

function isDefinedNum(x) {
  return isDefined(x) && !isNaN(x);
}
