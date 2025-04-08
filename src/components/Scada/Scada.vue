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
    position: { x: 70, y: 300 },
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
});
</script>

<template><div ref="jointEl"></div></template>
