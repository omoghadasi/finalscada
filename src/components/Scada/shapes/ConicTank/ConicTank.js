import { dia, util } from "@joint/core";
export default class ConicTank extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ConicTank",
      size: {
        width: 160,
        height: 100,
      },
      rotatable: true,
      attrs: {
        root: {
          magnetSelector: "body",
        },
        body: {
          stroke: "gray",
          strokeWidth: 4,
          x: 0,
          y: 0,
          width: "calc(w)",
          height: "calc(h)",
          rx: 120,
          ry: 10,
          fill: {
            type: "linearGradient",
            stops: [
              { offset: "0%", color: "gray" },
              { offset: "30%", color: "white" },
              { offset: "70%", color: "white" },
              { offset: "100%", color: "gray" },
            ],
          },
        },
        top: {
          x: 0,
          y: 20,
          width: "calc(w)",
          height: 20,
          fill: "none",
          stroke: "gray",
          strokeWidth: 2,
        },
        bottom: {
          d: "M 0 0 L calc(w) 0 L calc(w / 2 + 10) 70 h -20 Z",
          transform: "translate(0, calc(h - 10))",
          stroke: "gray",
          strokeLinejoin: "round",
          strokeWidth: 2,
          fill: {
            type: "linearGradient",
            stops: [
              { offset: "10%", color: "#aaa" },
              { offset: "30%", color: "#fff" },
              { offset: "90%", color: "#aaa" },
            ],
            attrs: {
              gradientTransform: "rotate(-10)",
            },
          },
        },
        label: {
          text: "Tank 2",
          textAnchor: "middle",
          textVerticalAnchor: "bottom",
          x: "calc(w / 2)",
          y: -10,
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#350100",
        },
      },
      ports: {
        groups: {
          input: {
            position: 'absolute',
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refX: 12, // فاصله متن از دایره
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
          output: {
            position: 'absolute',
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refX: 12, // فاصله متن از دایره
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
          inout: {
            position: 'absolute',
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refX: 12, // فاصله متن از دایره
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
        },
        items: []
      }
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
             <path @selector="bottom"/>
             <rect @selector="body"/>
             <rect @selector="top"/>
             <text @selector="label" />
         `;
    this.portMarkup = [
      {
        tagName: "circle",
        selector: "portBody", // Changed from 'circle' to 'portBody'
      },
      {
        tagName: "text",
        selector: "portLabel", // Changed from 'text' to 'portLabel'
      },
    ];
  }
}
