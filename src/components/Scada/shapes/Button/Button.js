import { dia } from "@joint/core";

export default class ButtonElement extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ButtonElement",
      size: { width: 120, height: 40 },
      rotatable: true,
      attrs: {
        body: {
          refWidth: "100%",
          refHeight: "100%",
          fill: "#4CAF50",
          stroke: "#45a049",
          strokeWidth: 1,
          rx: 4,
          ry: 4,
          cursor: "pointer",
        },
        label: {
          text: "Click Me",
          fill: "white",
          fontSize: 14,
          fontFamily: "Arial",
          textVerticalAnchor: "middle",
          textAnchor: "middle",
          refX: "50%",
          refY: "50%",
        },
      },
    };
  }

  preinitialize() {
    this.markup = [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ];
  }
}
