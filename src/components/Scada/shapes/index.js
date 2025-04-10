import { dia, util } from "@joint/core";
import ConicTank from "./ConicTank/ConicTank";
import ControlValve from "./ControlValve/ControlValve";
import ControlValveView from "./ControlValve/ControlValveView";
import HandValve from "./HandValve/HandValve";
import Join from "./Join/Join";
import LiquidTank from "./LiquidTank/LiquidTank";
import Panel from "./Panel/Panel";
import PanelView from "./Panel/PanelView";
import Pipe from "./Pipe/Pipe";
import PipeView from "./Pipe/PipeView";
import Pump from "./Pump/Pump";
import PumpView from "./Pump/PumpView";
import Zone from "./Zone/Zone";
import Charts from "./Charts";
import CircleProgressBar from "./CircleProgressBar/CircleProgressBar";
import ButtonElement from "./Button/Button";
import ButtonElementView from "./Button/ButtonView";
import FormElement from "./Form/Form";
import FormElementView from "./Form/FormView";

export default {
  ConicTank,
  ControlValve,
  ControlValveView,
  HandValve,
  Join,
  LiquidTank,
  Panel,
  PanelView,
  Pipe,
  PipeView,
  Pump,
  PumpView,
  Zone,
  ...Charts,
  CircleProgressBar,
  ButtonElement,
  ButtonElementView,
  FormElement,
  FormElementView,
};
