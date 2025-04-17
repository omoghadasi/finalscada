import PumpControl from "./PumpControl";
import SliderValveControl from "./SliderValveControl";
import ToggleValveControl from "./ToggleValveControl";
import ChartController from "./ChartBarController";
import ZoomController from "./ZoomController";
import MultiSelectController from "./MultiSelectController";

export default {
  controllers: {
    PumpControl,
    SliderValveControl,
    ToggleValveControl,
    ChartController,
    ZoomController,
    MultiSelectController, // اضافه کردن کنترلر انتخاب چندگانه
  },
  initControls: (paper) => {
    const graph = paper.model;

    // مقداردهی اولیه کنترلر انتخاب چندگانه
    const multiSelect = MultiSelectController(paper, graph);

    ZoomController(paper, document);
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
        case "ChartBar":
          ChartController.add(cell.findView(paper), "root", "chartCanvas");
          break;
      }
    });

    // دسترسی به المنت‌های انتخاب‌شده
    console.log(multiSelect.getSelectedElements());
  },
};
