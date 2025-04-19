import { dia, util } from "@joint/core";
export default class Join extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "Join",
      size: {
        width: 30,
        height: 30,
      },
      attrs: {
        body: {
          fill: "#eee",
          stroke: "#666",
          strokeWidth: 2,
          d: "M 10 0 H calc(w - 10) l 10 10 V calc(h - 10) l -10 10 H 10 l -10 -10 V 10 Z",
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
        items: []
      }
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
               <path @selector="body"/>
           `;
  }
}
