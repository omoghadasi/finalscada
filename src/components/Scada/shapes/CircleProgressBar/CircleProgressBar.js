import { dia, util } from "@joint/core";
export default class CircleProgressBar extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "CircleProgressBar",
      size: { width: 100, height: 100 }, // مقدار پیش‌فرض
      attrs: {
        backgroundCircle: {
          fill: "transparent",
          stroke: "#e0e0e0",
        },
        progressCircle: {
          fill: "transparent",
          stroke: "#76e5b1",
          strokeLinecap: "round",
        },
        label: {
          text: "0",
          fill: "#6bdba7",
          fontWeight: "bold",
          textAnchor: "middle",
        },
      },
      markup: [
        { tagName: "circle", selector: "backgroundCircle" },
        { tagName: "circle", selector: "progressCircle" },
        { tagName: "text", selector: "label" },
      ],
    };
  }

  setProgress(progress, labelText = null) {
    const r = this.attr("backgroundCircle/r") || 45;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - progress);
    this.attr("progressCircle/strokeDasharray", `${circ}`);
    this.attr("progressCircle/strokeDashoffset", `${offset}`);
    if (labelText !== null) {
      this.attr("label/text", labelText.toString());
    }
  }

  updateSize(newSize) {
    const { width, height } = newSize;
    const r = Math.min(width, height) / 2 - 8;
    const cx = width / 2;
    const cy = height / 2;
    const circ = 2 * Math.PI * r;

    this.resize(width, height);

    this.attr({
      backgroundCircle: {
        r,
        cx,
        cy,
        strokeWidth: 8,
      },
      progressCircle: {
        r,
        cx,
        cy,
        strokeWidth: 8,
        transform: `rotate(-90,${cx},${cy})`,
      },
      label: {
        x: cx,
        y: cy + 10,
        fontSize: r * 0.8,
      },
    });

    this.setProgress(20); // مقدار اولیه
  }
}
