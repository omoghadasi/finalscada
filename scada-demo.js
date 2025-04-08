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

// Joins

const join1 = new Join({
  position: { x: 772, y: 460 },
});

join1.addTo(graph);

const join2 = new Join({
  position: { x: 810, y: 605 },
});

join2.addTo(graph);

// Pipes

const tank1Pipe1 = new Pipe({
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

const tank1Pipe2 = new Pipe({
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

const tank2Pipe1 = new Pipe({
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

const ctrlValve1Pipe1 = new Pipe({
  source: { id: controlValve1.id, port: "right", anchor: { name: "right" } },
  target: { id: pump1.id, port: "left", anchor: { name: "left" } },
});

ctrlValve1Pipe1.addTo(graph);

const valve2Pipe1 = new Pipe({
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

const valve1Pipe1 = new Pipe({
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

const pump1Pipe1 = new Pipe({
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

const valve3Pipe1 = new Pipe({
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

const pump2Pipe1 = new Pipe({
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

const ctrlValve2Pipe1 = new Pipe({
  source: { id: controlValve2.id, port: "right", anchor: { name: "right" } },
  target: {
    id: pump2.id,
    port: "left",
    anchor: { name: "left", args: { rotate: true } },
    connectionPoint: { name: "anchor" },
  },
});

ctrlValve2Pipe1.addTo(graph);

const zone1Pipe1 = new Pipe({
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

const join1Pipe1 = new Pipe({
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

const join2Pipe1 = new Pipe({
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

// Charts

const maxPoints = 10;
const tankChart = new shapes.chart.Plot({
  position: { x: 50, y: 50 },
  size: { width: 300, height: 150 },
  series: [
    {
      name: "level",
      interpolate: "linear",
      showLegend: false,
      fillPadding: { top: 10 },
      data: Array.from({ length: maxPoints }).map((_, i) => ({
        x: i,
        y: START_LIQUID,
      })),
    },
  ],
  axis: {
    "y-axis": {
      min: 0,
      max: 200,
      ticks: 10,
    },
    "x-axis": {
      tickFormat: function (t) {
        const d = new Date(t * 1000);
        return (
          d.getMinutes().toString().padStart(2, "0") +
          ":" +
          d.getSeconds().toString().padStart(2, "0")
        );
      },
    },
  },
  padding: 0,
  markings: [
    {
      name: "max",
      start: { y: 80 },
    },
    {
      name: "min",
      end: { y: 20 },
    },
  ],
  // Historically, the chart shapes are defined without camel-cased attributes
  attrs: {
    ".": {
      "font-family": "sans-serif",
    },
    ".level path": {
      stroke: "#0075f2",
      "stroke-width": 1,
      "stroke-opacity": "0.8",
      fill: "#0075f2",
      "fill-opacity": "0.3",
    },
    ".marking.max rect": {
      fill: MAX_LIQUID_COLOR,
      height: 3,
    },
    ".marking.min rect": {
      fill: MIN_LIQUID_COLOR,
      height: 3,
    },
    ".point circle": {
      fill: "#0075f2",
      stroke: "none",
      opacity: 1,
    },
    ".y-axis > path, .x-axis > path": {
      stroke: "#131e29",
      "stroke-width": 2,
    },
    ".background rect": {
      fill: "#999",
      "fill-opacity": "0.1",
    },
  },
});

tankChart.addTo(graph);

const tankChartLink = new shapes.standard.Link({
  source: { id: tankChart.id },
  target: { id: tank1.id },
  attrs: {
    line: {
      strokeDasharray: "5 5",
      targetMarker: null,
      stroke: "#aaa",
    },
  },
});

tankChartLink.addTo(graph);

const gauge1 = new shapes.chart.Knob({
  position: { x: 380, y: 100 },
  size: { width: 120, height: 120 },
  min: 0,
  max: 10,
  step: 0.1,
  value: 1,
  fill: PRESSURE_COLOR,
  // Historically, the chart shapes are defined without camel-cased attributes
  attrs: {
    root: {
      "font-family": "sans-serif",
    },
  },
  serieDefaults: {
    startAngle: 90,
    label: "Ⓟ bar",
  },
  sliceDefaults: {
    legendLabel: "{value:.1f}",
    onClickEffect: { type: "none" },
  },
});

gauge1.addTo(graph);

const gauge1Link = new shapes.standard.Link({
  source: { id: gauge1.id, anchor: { name: "bottom" } },
  target: { id: ctrlValve1Pipe1.id },
  z: -1,
  attrs: {
    line: {
      strokeDasharray: "5 5",
      targetMarker: {
        type: "circle",
        r: 12,
        fill: "#eee",
        stroke: "#666",
        "stroke-width": 2,
      },
      stroke: "#aaa",
    },
  },
});

gauge1Link.addTo(graph);

const gauge2 = gauge1.clone();
const gauge2Link = gauge1Link.clone();

gauge2.position(380, 600);

gauge2Link.source({ id: gauge2.id, anchor: { name: "bottom" } });
gauge2Link.target({ id: ctrlValve2Pipe1.id });

gauge2.addTo(graph);
gauge2Link.addTo(graph);

// Controls
// A custom highlighters using the foreignObject element to embed HTML form controls
// The styling is done in CSS

const PumpControl = dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["power"],
  tagName: "g",
  children: util.svg/* xml */ `
         <foreignObject width="20" height="20">
             <div class="jj-checkbox" xmlns="http://www.w3.org/1999/xhtml">
                 <input @selector="input" class="jj-checkbox-input" type="checkbox" style="width: 14px; height: 14px; box-sizing: border-box; margin: 2px;"/>
             </div>
         </foreignObject>
     `,
  events: {
    "change input": "onChange",
  },
  attributes: {
    transform: "translate(5, 5)",
  },
  highlight: function (cellView) {
    this.renderChildren();
    this.childNodes.input.checked = Boolean(cellView.model.power);
  },
  onChange: function (evt) {
    this.cellView.model.power = evt.target.checked ? 1 : 0;
  },
});

const ToggleValveControl = dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["open"],
  children: util.svg/* xml */ `
         <foreignObject width="100" height="50">
             <div class="jj-switch" xmlns="http://www.w3.org/1999/xhtml">
                 <div @selector="label" class="jj-switch-label" style=""></div>
                 <button @selector="buttonOn" class="jj-switch-on">open</button>
                 <button @selector="buttonOff" class="jj-switch-off">close</button>
             </div>
         </foreignObject>
     `,
  events: {
    "click button": "onButtonClick",
  },
  highlight: function (cellView) {
    this.renderChildren();
    const { model } = cellView;
    const { el, childNodes } = this;
    const size = model.size();
    const isOpen = model.get("open");
    el.setAttribute(
      "transform",
      `translate(${size.width / 2 - 50}, ${size.height + 10})`
    );
    childNodes.buttonOn.disabled = !isOpen;
    childNodes.buttonOff.disabled = isOpen;
    childNodes.label.textContent = model.attr("label/text");
  },
  onButtonClick: function (evt) {
    const { model } = this.cellView;
    const isOpen = model.get("open");
    model.set("open", !isOpen);
  },
});

const SliderValveControl = dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["open"],
  children: util.svg/* xml */ `
         <foreignObject width="100" height="60">
             <div class="jj-slider" xmlns="http://www.w3.org/1999/xhtml">
                 <div @selector="label" class="jj-slider-label" style="">Valve 4</div>
                 <input @selector="slider" class="jj-slider-input" type="range" min="0" max="100" step="25" style="width:100%;"/>
                 <output @selector="value" class="jj-slider-output"></output>
             </div>
         </foreignObject>
     `,
  events: {
    "input input": "onInput",
  },
  highlight: function (cellView) {
    const { name = "" } = this.options;
    const { model } = cellView;
    const size = model.size();
    if (!this.childNodes) {
      // Render the slider only once to allow the user to drag it.
      this.renderChildren();
      this.childNodes.slider.value = model.get("open") * 100;
    }
    this.el.setAttribute(
      "transform",
      `translate(${size.width / 2 - 50}, ${size.height + 10})`
    );
    this.childNodes.label.textContent = name;
    this.childNodes.value.textContent = this.getSliderTextValue(
      model.get("open")
    );
  },
  getSliderTextValue: function (value = 0) {
    if (value === 0) {
      return "Closed";
    }
    if (value === 1) {
      return "Open";
    }
    return `${value * 100}% open`;
  },
  onInput: function (evt) {
    this.cellView.model.set("open", Number(evt.target.value) / 100);
  },
});

// Create all controls and add them to the graph
addControls(paper);

// Transform the paper so that the content fits the viewport
paper.transformToFitContent({
  useModelGeometry: true,
  padding: { top: 80, bottom: 10, horizontal: 50 },
  horizontalAlign: "middle",
  verticalAlign: "top",
});

// Start rendering the content and highlighters
paper.unfreeze();

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

function addControls(paper) {
  const graph = paper.model;
  graph.getElements().forEach((cell) => {
    switch (cell.get("type")) {
      case "ControlValve":
        SliderValveControl.add(cell.findView(paper), "root", "slider", {
          name: cell.attr("label/text"),
        });
        break;
      case "HandValve":
        ToggleValveControl.add(cell.findView(paper), "root", "button");
        break;
      case "Pump":
        PumpControl.add(cell.findView(paper), "root", "selection");
        break;
    }
  });
}

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

// Simulation
// A dummy system for the purpose of this demo

tank1.level = START_LIQUID;

let extraLiquid = 0;

setInterval(function () {
  const tank1Level = tank1.level;
  const liquidIn = g.random(0, 15);

  let newLevel = tank1Level + liquidIn;
  if (newLevel >= 100) {
    extraLiquid += newLevel - 100;
  } else {
    extraLiquid = 0;
  }

  // Tank 1 Instrumentation
  tankChart.addPoint(
    { x: tankChart.lastPoint("level").x + 1, y: tank1Level },
    "level",
    { maxLen: maxPoints }
  );

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
  gauge1.transition("value", pressure1 / 10);
  gauge1.transition(
    "fill",
    pressure1 > 30 ? MAX_PRESSURE_COLOR : PRESSURE_COLOR,
    { valueFunction: util.interpolate.hexColor, duration: 1000 }
  );

  // Gauge 2
  let pressure2 = ctrlValve2Pipe1Flow * 10;
  if (pressure2 > 0) {
    pressure2 += Math.min(30, extraLiquid * Math.max(1.1 - handValve3Open));
    if (handValve3Open === 0) {
      pressure2 += tank1Level * 0.3;
    }
  }
  gauge2.transition("value", pressure2 / 10);
  gauge2.transition(
    "fill",
    pressure2 > 30 ? MAX_PRESSURE_COLOR : PRESSURE_COLOR,
    { valueFunction: util.interpolate.hexColor, duration: 1000 }
  );
}, 1000);
