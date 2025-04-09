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
  UPDATE_ATTRIBUTES: ["chartData", "chartOption"],
  tagName: "g",
  children: util.svg/* xml */ `
      <foreignObject @selector="chart" width="100%" height="100%">
        <canvas @selector="chartCanvas" width="160" height="100"></canvas>
      </foreignObject>
     `,
  attributes: {
    transform: "translate(5, 5)",
  },
  highlight: function (cellView) {
    this.renderChildren();
    const canvas = this.childNodes.chartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chartData = cellView.model.chartData;
    const chartOption = cellView.model.chartOption;
    if (chartData || chartOption) {
      this.chart = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: chartOption,
      });
    }
  },
});
