import { dia } from "@joint/core";
const OPEN_FLAG = "OPEN";
export default dia.ElementView.extend({
  presentationAttributes: dia.ElementView.addPresentationAttributes({
    open: [OPEN_FLAG],
  }),

  initFlag: [dia.ElementView.Flags.RENDER, OPEN_FLAG],

  framePadding: 6,

  liquidAnimation: null,

  confirmUpdate(...args) {
    let flags = dia.ElementView.prototype.confirmUpdate.call(this, ...args);
    this.animateLiquid();
    if (this.hasFlag(flags, OPEN_FLAG)) {
      this.updateCover();
      flags = this.removeFlag(flags, OPEN_FLAG);
    }
    return flags;
  },

  updateCover() {
    const { model } = this;
    const opening = Math.max(0, Math.min(1, model.get("open") || 0));
    const [coverEl] = this.findBySelector("cover");
    const [coverFrameEl] = this.findBySelector("coverFrame");
    const frameWidth =
      Number(coverFrameEl.getAttribute("width")) - this.framePadding;
    const width = Math.round(frameWidth * (1 - opening));
    coverEl.animate(
      {
        width: [`${width}px`],
      },
      {
        fill: "forwards",
        duration: 200,
      }
    );
  },

  animateLiquid() {
    if (this.liquidAnimation) return;
    const [liquidEl] = this.findBySelector("liquid");
    this.liquidAnimation = liquidEl.animate(
      {
        // 24 matches the length of the liquid path
        strokeDashoffset: [0, 24],
      },
      {
        fill: "forwards",
        iterations: Infinity,
        duration: 3000,
      }
    );
  },
});
