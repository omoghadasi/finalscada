import { dia } from "@joint/core";

export default class ImageElement extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ImageElement",
      size: { width: 150, height: 150 },
      rotatable: true,
      imageUrl: "",
      attrs: {
        body: {
          refWidth: "100%",
          refHeight: "100%",
          fill: "transparent",
          rx: 5,
          ry: 5,
        },
        foreignObject: {
          refWidth: "100%",
          refHeight: "100%",
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
    this.markup = [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "foreignObject",
        selector: "foreignObject",
        children: [
          {
            tagName: "div",
            namespaceURI: "http://www.w3.org/1999/xhtml",
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "5px",
            },
            children: [
              {
                tagName: "img",
                attributes: {
                  src: "",
                  alt: "Please Double click",
                },
                style: {
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                },
              },
            ],
          },
        ],
      },
      {
        tagName: "text",
        selector: "label",
      },
    ];
  }

  setImageUrl(url) {
    // ذخیره URL برای استفاده بعدی
    this.prop("imageUrl", url);
    return this;
  }

  setLabel(text) {
    return this.attr("label/text", text);
  }
}
