import { dia } from "@joint/core";
const LEVEL_FLAG = "LEVEl";

export default dia.ElementView.extend({
  presentationAttributes: dia.ElementView.addPresentationAttributes({
    level: [LEVEL_FLAG],
    color: [LEVEL_FLAG],
  }),

  initFlag: [dia.ElementView.Flags.RENDER, LEVEL_FLAG],

  confirmUpdate(...args) {
    let flags = dia.ElementView.prototype.confirmUpdate.call(this, ...args);
    if (this.hasFlag(flags, LEVEL_FLAG)) {
      // this.updateLevel(); todo enable
      flags = this.removeFlag(flags, LEVEL_FLAG);
    }
    return flags;
  },

  updateLevel() {
    const { model } = this;
    const level = Math.max(0, Math.min(100, model.get("level") || 0));
    const color = model.get("color") || "red";
    const [liquidEl] = this.findBySelector("liquid");
    console.log(liquidEl);

    const [windowEl] = this.findBySelector("frame");
    const windowHeight = Number(windowEl.getAttribute("height"));
    const height = Math.round((windowHeight * level) / 100);
    liquidEl.animate(
      {
        height: [`${height}px`],
        fill: [color],
      },
      {
        fill: "forwards",
        duration: 1000,
      }
    );
  },
});
