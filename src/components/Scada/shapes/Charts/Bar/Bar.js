import { dia, util } from "@joint/core";
export default class ChartBar extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ChartBar",
      chart: null,
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
      singleData: null,
      keepItem: 5,
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
    return this.get("chartData") || null;
  }

  set chartData(value) {
    this.set("chartData", value);
  }

  get chartOpion() {
    return this.get("chartData") || null;
  }

  set chartOpion(value) {
    this.set("chartData", value);
  }
  get singleData() {
    return this.get("singleData") || null;
  }

  set singleData(value) {
    this.set("singleData", value);
  }
  get chart() {
    return this.get("chart") || null;
  }

  set chart(value) {
    this.set("chart", value);
  }
  get keepItem() {
    return this.get("keepItem") || null;
  }

  set keepItem(value) {
    this.set("keepItem", value);
  }
}
