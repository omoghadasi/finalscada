import { dia, util } from "@joint/core";
const LIQUID_COLOR = "#0EAD69";
export default class Pipe extends dia.Link {
  defaults() {
    return {
      ...super.defaults,
      type: "Pipe",
      z: -1,
      router: { name: "rightAngle" },
      flow: 1,
      attrs: {
        liquid: {
          connection: true,
          stroke: LIQUID_COLOR,
          strokeWidth: 10,
          strokeLinejoin: "round",
          strokeLinecap: "square",
          strokeDasharray: "10,20",
        },
        line: {
          connection: true,
          stroke: "#eee",
          strokeWidth: 10,
          strokeLinejoin: "round",
          strokeLinecap: "round",
        },
        outline: {
          connection: true,
          stroke: "#444",
          strokeWidth: 16,
          strokeLinejoin: "round",
          strokeLinecap: "round",
        },
      },
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
               <path @selector="outline" fill="none"/>
               <path @selector="line" fill="none"/>
               <path @selector="liquid" fill="none"/>
           `;
  }
}
