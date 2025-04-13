import { dia } from "@joint/core";

export default class FormElement extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "FormElement",
      size: { width: 200, height: 180 },
      rotatable: true,
      attrs: {
        body: {
          refWidth: "100%",
          refHeight: "100%",
          fill: "#ffffff",
          stroke: "#aaaaaa",
          strokeWidth: 1,
          rx: 8,
          ry: 8,
        },
        foreignObject: {
          refWidth: "100%",
          refHeight: "100%",
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
              padding: "10px",
            },
            children: [
              {
                tagName: "input",
                attributes: {
                  type: "text",
                  name: "name",
                  placeholder: "Enter name",
                },
                style: {
                  width: "100%",
                  marginBottom: "10px",
                  padding: "5px",
                },
              },
              {
                tagName: "input",
                attributes: {
                  type: "email",
                  name: "email",
                  placeholder: "Enter email",
                },
                style: {
                  width: "100%",
                  marginBottom: "10px",
                  padding: "5px",
                },
              },
              {
                tagName: "button",
                textContent: "Submit",
                style: {
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                },
              },
            ],
          },
        ],
      },
    ];
  }
}
