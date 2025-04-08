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
});
</script>

<template><div ref="jointEl"></div></template>
