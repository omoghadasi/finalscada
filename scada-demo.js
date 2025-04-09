/*! JointJS+ v3.7.0 - HTML5 Diagramming Framework

Copyright (c) 2023 client IO

 2023-07-12

This Source Code Form is subject to the terms of the JointJS+ License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/

const { dia, shapes, util, ui } = joint;

const paperContainerEl = document.getElementById("paper-container");
const toolbarContainerEl = document.getElementById("toolbar-container");

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

document.documentElement.style.setProperty("--liquid-color", LIQUID_COLOR);

// Pump metrics
const r = 30;
const d = 10;
const l = (3 * r) / 4;
const step = 20;

// Toolbar

const toolbar = new ui.Toolbar({
  tools: [
    {
      type: "label",
      name: "title",
      text: "SCADA: Piping & Instrumentation Diagram",
    },
    {
      type: "separator",
    },
    {
      type: "checkbox",
      name: "controls",
      label: "Controls",
      value: true,
    },
    {
      type: "checkbox",
      name: "instrumentation",
      label: "Instrumentation",
      value: true,
    },
    {
      type: "separator",
    },
    {
      type: "label",
      text: "Color",
    },
    {
      type: "color-picker",
      name: "color",
      value: getComputedStyle(document.documentElement).getPropertyValue(
        "--accent-color"
      ),
    },
  ],
});

toolbarContainerEl.appendChild(toolbar.el);

toolbar.render();
toolbar.on({
  "controls:change": (value) => {
    if (value) {
      addControls(paper);
    } else {
      removeControls(paper);
    }
  },
  "instrumentation:change": (value) => {
    if (value) {
      addCharts(paper);
    } else {
      removeCharts(paper);
    }
  },
  "color:input": (value) => {
    document.documentElement.style.setProperty("--accent-color", value);
  },
});

function removeControls(paper) {
  SliderValveControl.removeAll(paper);
  ToggleValveControl.removeAll(paper);
  PumpControl.removeAll(paper);
}

function addCharts(paper) {
  paper.options.viewport = null;
}

function removeCharts(paper) {
  const chartTypes = ["chart.Knob", "chart.Plot", "standard.Link"];
  paper.options.viewport = (view) => {
    return !chartTypes.includes(view.model.get("type"));
  };
}
