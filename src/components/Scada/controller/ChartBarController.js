import { dia, util } from "@joint/core";
import {
  Chart,
  LinearScale,
  BarElement,
  CategoryScale,
  BarController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(
  LinearScale,
  BarElement,
  CategoryScale,
  BarController,
  Title,
  Tooltip,
  Legend
);
export default dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["chartData", "chartOption", "singleData"],
  tagName: "g",
  children: util.svg/* xml */ `
      <foreignObject @selector="chart" width="400" height="280">
        <canvas @selector="chartCanvas" style="background: white;"></canvas>
      </foreignObject>
     `,
  attributes: {
    transform: "translate(5, 5)",
  },

  highlight: function (cellView) {
    if (!this.childNodes && !this.childNodes?.chartCanvas) {
      this.renderChildren();
    }
    const canvas = this.childNodes.chartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chartData = cellView.model.chartData;
    const chartOption = cellView.model.chartOption;
    const singleData = cellView.model.singleData;
    const keepItem = cellView.model.keepItem || 10;
    let chart = cellView.model.chart;
    if (!chart) {
      cellView.model.chart = new Chart(ctx, {
        type: "bar",
        data: {},
        options: {},
      });
      chart = cellView.model.chart;
    }

    if (!cellView.model._chart_listener_set) {
      cellView.model._chart_listener_set = true;

      if (chartData) {
        chart.data = chartData;
        chart.update();
      }

      cellView.model.on("change:singleData", (model, singleData) => {
        if (!chart.data.datasets[0]) {
          chart.data.datasets.push({ data: [] });
        }

        if (
          chart.data.datasets[0].data.length >= keepItem ||
          chart.data.labels.length >= keepItem
        ) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }

        chart.data.labels.push(singleData.label);
        chart.data.datasets[0].data.push(singleData.data);
        chart.update();
      });

      cellView.model.on("change:chartData", (model, singleData) => {
        const chartData = model.get("chartData");
        chart.data = chartData;
        chart.update();
      });
    }
  },
});
