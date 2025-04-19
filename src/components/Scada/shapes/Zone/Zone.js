import { dia, util } from "@joint/core";
const LIQUID_COLOR = "#0EAD69";
export default class Zone extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "Zone",
      size: {
        width: 120,
        height: 40,
      },
      rotatable: true,
      attrs: {
        body: {
          fill: "#ffffff",
          stroke: "#cad8e3",
          strokeWidth: 1,
          d: "M 0 calc(0.5*h) calc(0.5*h) 0 H calc(w) V calc(h) H calc(0.5*h) Z",
        },
        label: {
          fontSize: 14,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fill: LIQUID_COLOR,
          textVerticalAnchor: "middle",
          textAnchor: "middle",
          x: "calc(w / 2 + 10)",
          y: "calc(h / 2)",
        },
      },
      ports: {
        groups: {
          input: {
            position: 'absolute',
            attrs: {
              portBody: {
                r: 6,
                magnet: false,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                magnet: false,
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
                magnet: false,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                magnet: false,
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
                magnet: false,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                magnet: false,
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
        items: [
          {
            id: "output",
            group: "output",
            linkType: 'pipe',
            attrs: {
              position: {
                x: 0,
                y: 12,
              },
            },
          },
        ]
      }
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
               <path @selector="body"/>
               <text @selector="label"/>
           `;
  }
}
