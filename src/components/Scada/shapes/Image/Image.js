import { dia, util } from "@joint/core";

export default class ImageElement extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ImageElement",
      size: { width: 150, height: 150 },
      rotatable: true,
      imageUrl: "",
      attrs: {
        root: {
          magnetSelector: "body",
        },
        body: {
          refWidth: "100%",
          refHeight: "100%",
          fill: "#ffffff",
          stroke: "#aaaaaa",
          strokeWidth: 1,
          rx: 5,
          ry: 5,
        },
        image: {
          refWidth: "calc(w-10)",
          refHeight: "calc(h-10)",
          refX: 5,
          refY: 5,
          xlinkHref: "",
          preserveAspectRatio: "xMidYMid meet",
        },
        label: {
          textVerticalAnchor: "bottom",
          textAnchor: "middle",
          refX: "50%",
          refY: -10,
          fontSize: 14,
          fill: "#333333",
          text: "Image",
        },
      },
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
      <rect @selector="body"/>
      <image @selector="image"/>
      <text @selector="label" />
    `;
  }

  setImageUrl(url) {
    return this.attr("image/xlinkHref", url);
  }

  setLabel(text) {
    return this.attr("label/text", text);
  }

  // اضافه کردن متد برای تنظیم اندازه
  initialize() {
    dia.Element.prototype.initialize.apply(this, arguments);

    // اطمینان از اینکه اندازه اولیه تنظیم شده است
    if (
      !this.get("size") ||
      !this.get("size").width ||
      !this.get("size").height
    ) {
      this.resize(150, 150);
    }
  }
}
