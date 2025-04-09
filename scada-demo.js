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
