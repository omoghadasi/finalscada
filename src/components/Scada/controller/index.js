import PumpControl from "./PumpControl";
import SliderValveControl from "./SliderValveControl";
import ToggleValveControl from "./ToggleValveControl";

export default {
  controllers: {
    PumpControl,
    SliderValveControl,
    ToggleValveControl,
  },
  initControls: (paper) => {
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
  },
};
