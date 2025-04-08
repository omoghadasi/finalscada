import { dia } from "@joint/core";
const FLOW_FLAG = "FLOW";
export default dia.LinkView.extend({
  presentationAttributes: dia.LinkView.addPresentationAttributes({
    flow: [FLOW_FLAG],
  }),

  initFlag: [...dia.LinkView.prototype.initFlag, FLOW_FLAG],

  flowAnimation: null,

  confirmUpdate(...args) {
    let flags = dia.LinkView.prototype.confirmUpdate.call(this, ...args);
    if (this.hasFlag(flags, FLOW_FLAG)) {
      this.updateFlow();
      flags = this.removeFlag(flags, FLOW_FLAG);
    }
    return flags;
  },

  getFlowAnimation() {
    let { flowAnimation } = this;
    if (flowAnimation) return flowAnimation;
    const [liquidEl] = this.findBySelector("liquid");
    // stroke-dashoffset = sum(stroke-dasharray) * n;
    // 90 = 10 + 20 + 10 + 20 + 10 + 20
    const keyframes = { strokeDashoffset: [90, 0] };
    flowAnimation = liquidEl.animate(keyframes, {
      fill: "forwards",
      duration: 1000,
      iterations: Infinity,
    });
    this.flowAnimation = flowAnimation;
    return flowAnimation;
  },

  updateFlow() {
    const { model } = this;
    const flowRate = model.get("flow") || 0;
    this.getFlowAnimation().playbackRate = flowRate;
    const [liquidEl] = this.findBySelector("liquid");
    liquidEl.style.stroke = flowRate === 0 ? "#ccc" : "";
  },
});
