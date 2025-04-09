import { dia, util } from "@joint/core";
import { Chart } from "chart.js";

export default class ChartBar extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ChartBar",
      chartData: {
        labels: ["A", "B", "C"],
        datasets: [
          {
            label: "Example Dataset",
            data: [10, 20, 30],
            backgroundColor: ["#ff0000", "#00ff00", "#0000ff"],
          },
        ],
      },
      chartOpion: {},
      attrs: {
        root: {
          magnetSelector: "body",
        },
        label: {
          text: "Chart Bar 1",
          textAnchor: "middle",
          textVerticalAnchor: "bottom",
          x: "calc(w / 2)",
          y: -10,
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#350100",
        },
      },
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
      <text @selector="label" />
    `;
  }

  get chartData() {
    return this.get("chartData") || 0;
  }

  set chartData(value) {
    this.set("chartData", value);
  }

  get chartOpion() {
    return this.get("chartData") || 0;
  }

  set chartOpion(value) {
    this.set("chartData", value);
  }
}
