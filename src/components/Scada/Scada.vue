<script setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { dia, shapes } from "@joint/core";
const jointEl = ref("jointEl");
import CustomShapes from "./shapes";

const namespace = {
  ...shapes,
  ...CustomShapes,
};
// Custom view flags
const POWER_FLAG = "POWER";
const LIGHT_FLAG = "LIGHT";
const FLOW_FLAG = "FLOW";
const OPEN_FLAG = "OPEN";

// Constants
const LIQUID_COLOR = "#0EAD69";
const MAX_LIQUID_COLOR = "#ED2637";
const MIN_LIQUID_COLOR = "#FFD23F";
const START_LIQUID = 70;
const PRESSURE_COLOR = "#1446A0";
const MAX_PRESSURE_COLOR = "#ED2637";

const graph = new dia.Graph(
  {},
  {
    cellNamespace: namespace,
  }
);

onMounted(() => {
  const paper = new dia.Paper({
    el: jointEl.value,
    cellViewNamespace: namespace,
    model: graph,
    width: 1800,
    height: 800,
    gridSize: 10,
    drawGrid: "mesh",
    interactive: true,
    linkPinning: false,
    markAvailable: true,
    async: true,
    frozen: false,
    sorting: dia.Paper.sorting.APPROX,
    background: { color: "#F3F7F6" },
    // interactive: {
    //   linkMove: false,
    //   stopDelegation: false,
    // },
    defaultAnchor: {
      name: "perpendicular",
    },
  });

  // Tanks

  const tank1 = new namespace.LiquidTank();
  const panel1 = new namespace.Panel({
    position: { x: 30, y: 50 },
  });

  // When the tank level changes, update the panel level and color.
  panel1.listenTo(tank1, "change:level", (_, level) => {
    const color =
      level > 80
        ? MAX_LIQUID_COLOR
        : level < 20
        ? MIN_LIQUID_COLOR
        : LIQUID_COLOR;
    panel1.set({ level, color });
  });

  tank1.addTo(graph);
  panel1.addTo(graph);
  tank1.embed(panel1);

  // Tank 2

  const tank2 = new namespace.ConicTank({
    position: { x: 820, y: 200 },
  });

  tank2.addTo(graph);

  // Pumps

  const pump1 = new namespace.Pump({
    position: { x: 460, y: 250 },
    attrs: {
      label: {
        text: "Pump 1",
      },
    },
  });

  pump1.addTo(graph);
  pump1.power = 1;

  const pump2 = new namespace.Pump({
    position: { x: 460, y: 450 },
    attrs: {
      label: {
        text: "Pump 2",
      },
    },
  });

  pump2.addTo(graph);
  pump2.power = 0;

  // CTRL Valves

  const controlValve1 = new namespace.ControlValve({
    position: { x: 300, y: 295 },
    open: 1,
    attrs: {
      label: {
        text: "CTRL Valve 1",
      },
    },
  });

  controlValve1.addTo(graph);

  const controlValve2 = new namespace.ControlValve({
    position: { x: 300, y: 495 },
    open: 0.25,
    attrs: {
      label: {
        text: "CTRL Valve 2",
      },
    },
  });

  controlValve2.addTo(graph);

  // Zones

  const zone1 = new namespace.Zone({
    position: { x: 50, y: 600 },
    attrs: {
      label: {
        text: "Zone 1",
      },
    },
  });

  const zone2 = new namespace.Zone({
    position: { x: 865, y: 600 },
    attrs: {
      label: {
        text: "Zone 2",
      },
    },
  });

  graph.addCells([zone1, zone2]);

  // Hand Valves

  const handValve1 = new namespace.HandValve({
    position: { x: 875, y: 450 },
    open: 1,
    angle: 270,
    attrs: {
      label: {
        text: "Valve 1",
      },
    },
  });

  handValve1.addTo(graph);

  const handValve2 = new namespace.HandValve({
    position: { x: 650, y: 250 },
    open: 1,
    angle: 0,
    attrs: {
      label: {
        text: "Valve 2",
      },
    },
  });

  handValve2.addTo(graph);

  const handValve3 = new namespace.HandValve({
    position: { x: 650, y: 450 },
    open: 1,
    angle: 0,
    attrs: {
      label: {
        text: "Valve 3",
      },
    },
  });

  handValve3.addTo(graph);

  // Joins

  const join1 = new namespace.Join({
    position: { x: 772, y: 460 },
  });

  join1.addTo(graph);

  const join2 = new namespace.Join({
    position: { x: 810, y: 605 },
  });

  join2.addTo(graph);

  // Pipes

  const tank1Pipe1 = new namespace.Pipe({
    source: {
      id: tank1.id,
      anchor: { name: "right", args: { dy: -25 } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: controlValve1.id,
      port: "left",
      anchor: { name: "left" },
    },
  });

  tank1Pipe1.addTo(graph);

  const tank1Pipe2 = new namespace.Pipe({
    source: {
      id: tank1.id,
      anchor: { name: "bottomRight", args: { dy: -40 } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: controlValve2.id,
      port: "left",
      anchor: { name: "left" },
      connectionPoint: { name: "anchor" },
    },
  });

  tank1Pipe2.addTo(graph);

  const tank2Pipe1 = new namespace.Pipe({
    source: {
      id: tank2.id,
      selector: "bottom",
      anchor: { name: "bottom" },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: handValve1.id,
      port: "right",
      anchor: { name: "right", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
  });

  tank2Pipe1.addTo(graph);

  const ctrlValve1Pipe1 = new namespace.Pipe({
    source: { id: controlValve1.id, port: "right", anchor: { name: "right" } },
    target: { id: pump1.id, port: "left", anchor: { name: "left" } },
  });

  ctrlValve1Pipe1.addTo(graph);

  const valve2Pipe1 = new namespace.Pipe({
    source: {
      id: handValve2.id,
      port: "right",
      anchor: { name: "right", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: join1.id,
      anchor: { name: "top" },
      connectionPoint: { name: "anchor" },
    },
  });

  valve2Pipe1.addTo(graph);

  const valve1Pipe1 = new namespace.Pipe({
    source: {
      id: handValve1.id,
      port: "left",
      anchor: { name: "left", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: join2.id,
      anchor: { name: "top" },
      connectionPoint: { name: "anchor" },
    },
  });

  valve1Pipe1.addTo(graph);

  const pump1Pipe1 = new namespace.Pipe({
    source: {
      id: pump1.id,
      port: "right",
      anchor: { name: "right", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: handValve2.id,
      port: "left",
      anchor: { name: "left", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
  });

  pump1Pipe1.addTo(graph);

  const valve3Pipe1 = new namespace.Pipe({
    source: {
      id: handValve3.id,
      port: "right",
      anchor: { name: "right", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: join1.id,
      anchor: { name: "left" },
      connectionPoint: { name: "anchor" },
    },
  });

  valve3Pipe1.addTo(graph);

  const pump2Pipe1 = new namespace.Pipe({
    source: {
      id: pump2.id,
      port: "right",
      anchor: { name: "right", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: handValve3.id,
      port: "left",
      anchor: { name: "left", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
  });

  pump2Pipe1.addTo(graph);

  const ctrlValve2Pipe1 = new namespace.Pipe({
    source: { id: controlValve2.id, port: "right", anchor: { name: "right" } },
    target: {
      id: pump2.id,
      port: "left",
      anchor: { name: "left", args: { rotate: true } },
      connectionPoint: { name: "anchor" },
    },
  });

  ctrlValve2Pipe1.addTo(graph);

  const zone1Pipe1 = new namespace.Pipe({
    source: {
      id: zone1.id,
      port: "left",
      anchor: { name: "left", args: { rotate: true, dx: 10 } },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: tank1.id,
      anchor: { name: "bottomLeft", args: { dy: -30 } },
      connectionPoint: { name: "anchor" },
    },
  });

  zone1Pipe1.addTo(graph);

  const join1Pipe1 = new namespace.Pipe({
    source: {
      id: join1.id,
      anchor: { name: "bottom" },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: join2.id,
      anchor: { name: "left" },
      connectionPoint: { name: "anchor" },
    },
  });

  join1Pipe1.addTo(graph);

  const join2Pipe1 = new namespace.Pipe({
    source: {
      id: join2.id,
      anchor: { name: "right" },
      connectionPoint: { name: "anchor" },
    },
    target: {
      id: zone2.id,
      anchor: { name: "left", args: { dx: 10 } },
      connectionPoint: { name: "anchor" },
    },
  });

  join2Pipe1.addTo(graph);

  // Transform the paper so that the content fits the viewport
  paper.transformToFitContent({
    useModelGeometry: true,
    padding: { top: 80, bottom: 10, horizontal: 50 },
    horizontalAlign: "middle",
    verticalAlign: "top",
  });

  // Start rendering the content and highlighters
  paper.unfreeze();

  // Simulation
  // A dummy system for the purpose of this demo

  tank1.level = START_LIQUID;

  let extraLiquid = 0;

  setInterval(function () {
    const tank1Level = tank1.level;
    const liquidIn = Math.round(Math.random() * 15);

    let newLevel = tank1Level + liquidIn;
    if (newLevel >= 100) {
      extraLiquid += newLevel - 100;
    } else {
      extraLiquid = 0;
    }

    // Tank 1 Instrumentation todo badan
    // tankChart.addPoint(
    //   { x: tankChart.lastPoint("level").x + 1, y: tank1Level },
    //   "level",
    //   { maxLen: maxPoints }
    // );

    // Tank 1 Pipes
    const tank1Pipe1Flow = tank1Level > 70 ? 1 : 0;
    const tank1Pipe2Flow = tank1Level > 0 ? 1 : 0;
    tank1Pipe1.set("flow", tank1Pipe1Flow);
    tank1Pipe2.set("flow", tank1Pipe2Flow);

    // CTRL Valve 1
    const ctrlValve1Open = controlValve1.get("open");
    const ctrlValve1Pipe1Flow = tank1Pipe1Flow * ctrlValve1Open;
    ctrlValve1Pipe1.set("flow", ctrlValve1Pipe1Flow);
    // CTRL Valve 2
    const ctrlValve2Open = controlValve2.get("open");
    const ctrlValve2Pipe1Flow = tank1Pipe2Flow * ctrlValve2Open;
    ctrlValve2Pipe1.set("flow", ctrlValve2Pipe1Flow);

    // Pump 1
    const pump1Power = pump1.power;
    const pump1Pipe1Flow = ctrlValve1Pipe1Flow * (1 + 2 * pump1Power);
    pump1Pipe1.set("flow", pump1Pipe1Flow);

    // Pump 2
    const pump2Power = pump2.power;
    const pump2Pipe1Flow = ctrlValve2Pipe1Flow * (1 + 2 * pump2Power);
    pump2Pipe1.set("flow", pump2Pipe1Flow);

    // Hand Valve 2
    const handValve2Open = Number(handValve2.get("open"));
    const handValve2Pipe1Flow = pump1Pipe1Flow * handValve2Open;
    valve2Pipe1.set("flow", handValve2Pipe1Flow);

    // Hand Valve 3
    const handValve3Open = Number(handValve3.get("open"));
    const handValve3Pipe1Flow = pump2Pipe1Flow * handValve3Open;
    valve3Pipe1.set("flow", handValve3Pipe1Flow);

    // Join 1
    const join1Pipe1Flow = handValve2Pipe1Flow + handValve3Pipe1Flow;
    join1Pipe1.set("flow", join1Pipe1Flow);

    // Tank 2
    const tank2Pipe1Flow = 0.5; // constant flow
    tank2Pipe1.set("flow", tank2Pipe1Flow);

    // Hand Valve 1
    const handValve1Open = Number(handValve1.get("open"));
    const handValve1Pipe1Flow = tank2Pipe1Flow * handValve1Open;
    valve1Pipe1.set("flow", handValve1Pipe1Flow);

    // Join 2
    const join2Pipe1Flow = join1Pipe1Flow + handValve1Pipe1Flow;
    join2Pipe1.set("flow", join2Pipe1Flow);

    // Tank1
    const liquidOut = join2Pipe1Flow * 4;
    tank1.level = tank1Level + liquidIn - liquidOut;

    // Gauge 1
    let pressure1 = ctrlValve1Pipe1Flow * 10;
    if (pressure1 > 0) {
      pressure1 += Math.min(30, extraLiquid * Math.max(1.1 - handValve2Open));
      if (handValve2Open === 0) {
        pressure1 += Math.max(0, tank1Level - 70) * 0.3;
      }
    }
    // todo badan
    // gauge1.transition("value", pressure1 / 10);
    // gauge1.transition(
    //   "fill",
    //   pressure1 > 30 ? MAX_PRESSURE_COLOR : PRESSURE_COLOR,
    //   { valueFunction: util.interpolate.hexColor, duration: 1000 }
    // );

    // Gauge 2
    let pressure2 = ctrlValve2Pipe1Flow * 10;
    if (pressure2 > 0) {
      pressure2 += Math.min(30, extraLiquid * Math.max(1.1 - handValve3Open));
      if (handValve3Open === 0) {
        pressure2 += tank1Level * 0.3;
      }
    }
    // todo badan
    // gauge2.transition("value", pressure2 / 10);
    // gauge2.transition(
    //   "fill",
    //   pressure2 > 30 ? MAX_PRESSURE_COLOR : PRESSURE_COLOR,
    //   { valueFunction: util.interpolate.hexColor, duration: 1000 }
    // );
  }, 1000);

  // // Charts todo badan

  // const maxPoints = 10;
  // const tankChart = new shapes.chart.Plot({
  //   position: { x: 50, y: 50 },
  //   size: { width: 300, height: 150 },
  //   series: [
  //     {
  //       name: "level",
  //       interpolate: "linear",
  //       showLegend: false,
  //       fillPadding: { top: 10 },
  //       data: Array.from({ length: maxPoints }).map((_, i) => ({
  //         x: i,
  //         y: START_LIQUID,
  //       })),
  //     },
  //   ],
  //   axis: {
  //     "y-axis": {
  //       min: 0,
  //       max: 200,
  //       ticks: 10,
  //     },
  //     "x-axis": {
  //       tickFormat: function (t) {
  //         const d = new Date(t * 1000);
  //         return (
  //           d.getMinutes().toString().padStart(2, "0") +
  //           ":" +
  //           d.getSeconds().toString().padStart(2, "0")
  //         );
  //       },
  //     },
  //   },
  //   padding: 0,
  //   markings: [
  //     {
  //       name: "max",
  //       start: { y: 80 },
  //     },
  //     {
  //       name: "min",
  //       end: { y: 20 },
  //     },
  //   ],
  //   // Historically, the chart shapes are defined without camel-cased attributes
  //   attrs: {
  //     ".": {
  //       "font-family": "sans-serif",
  //     },
  //     ".level path": {
  //       stroke: "#0075f2",
  //       "stroke-width": 1,
  //       "stroke-opacity": "0.8",
  //       fill: "#0075f2",
  //       "fill-opacity": "0.3",
  //     },
  //     ".marking.max rect": {
  //       fill: MAX_LIQUID_COLOR,
  //       height: 3,
  //     },
  //     ".marking.min rect": {
  //       fill: MIN_LIQUID_COLOR,
  //       height: 3,
  //     },
  //     ".point circle": {
  //       fill: "#0075f2",
  //       stroke: "none",
  //       opacity: 1,
  //     },
  //     ".y-axis > path, .x-axis > path": {
  //       stroke: "#131e29",
  //       "stroke-width": 2,
  //     },
  //     ".background rect": {
  //       fill: "#999",
  //       "fill-opacity": "0.1",
  //     },
  //   },
  // });

  // tankChart.addTo(graph);

  // const tankChartLink = new shapes.standard.Link({
  //   source: { id: tankChart.id },
  //   target: { id: tank1.id },
  //   attrs: {
  //     line: {
  //       strokeDasharray: "5 5",
  //       targetMarker: null,
  //       stroke: "#aaa",
  //     },
  //   },
  // });

  // tankChartLink.addTo(graph);

  // const gauge1 = new shapes.chart.Knob({
  //   position: { x: 380, y: 100 },
  //   size: { width: 120, height: 120 },
  //   min: 0,
  //   max: 10,
  //   step: 0.1,
  //   value: 1,
  //   fill: PRESSURE_COLOR,
  //   // Historically, the chart shapes are defined without camel-cased attributes
  //   attrs: {
  //     root: {
  //       "font-family": "sans-serif",
  //     },
  //   },
  //   serieDefaults: {
  //     startAngle: 90,
  //     label: "Ⓟ bar",
  //   },
  //   sliceDefaults: {
  //     legendLabel: "{value:.1f}",
  //     onClickEffect: { type: "none" },
  //   },
  // });

  // gauge1.addTo(graph);

  // const gauge1Link = new shapes.standard.Link({
  //   source: { id: gauge1.id, anchor: { name: "bottom" } },
  //   target: { id: ctrlValve1Pipe1.id },
  //   z: -1,
  //   attrs: {
  //     line: {
  //       strokeDasharray: "5 5",
  //       targetMarker: {
  //         type: "circle",
  //         r: 12,
  //         fill: "#eee",
  //         stroke: "#666",
  //         "stroke-width": 2,
  //       },
  //       stroke: "#aaa",
  //     },
  //   },
  // });

  // gauge1Link.addTo(graph);

  // const gauge2 = gauge1.clone();
  // const gauge2Link = gauge1Link.clone();

  // gauge2.position(380, 600);

  // gauge2Link.source({ id: gauge2.id, anchor: { name: "bottom" } });
  // gauge2Link.target({ id: ctrlValve2Pipe1.id });

  // gauge2.addTo(graph);
  // gauge2Link.addTo(graph);
});
</script>

<template><div ref="jointEl"></div></template>
