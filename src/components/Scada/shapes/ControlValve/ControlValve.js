import { dia, util } from "@joint/core";
const LIQUID_COLOR = "#0EAD69";
export default class ControlValve extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "ControlValve",
      size: {
        width: 60,
        height: 60,
      },
      resizable: true,
      scaleOnResize: true,
      open: 1,
      attrs: {
        root: {
          magnetSelector: "body",
        },
        body: {
          rx: "calc(w / 2)",
          ry: "calc(h / 2)",
          cx: "calc(w / 2)",
          cy: "calc(h / 2)",
          stroke: "gray",
          strokeWidth: 2,
          fill: {
            type: "radialGradient",
            stops: [
              { offset: "80%", color: "white" },
              { offset: "100%", color: "gray" },
            ],
          },
        },
        liquid: {
          // We use path instead of rect to make it possible to animate
          // the stroke-dasharray to show the liquid flow.
          d: "M calc(w / 2 + 12) calc(h / 2) h -24",
          stroke: LIQUID_COLOR,
          strokeWidth: 24,
          strokeDasharray: "3,1",
        },
        cover: {
          x: "calc(w / 2 - 12)",
          y: "calc(h / 2 - 12)",
          width: 24,
          height: 24,
          stroke: "#333",
          strokeWidth: 2,
          fill: "#fff",
        },
        coverFrame: {
          x: "calc(w / 2 - 15)",
          y: "calc(h / 2 - 15)",
          width: 30,
          height: 30,
          stroke: "#777",
          strokeWidth: 2,
          fill: "none",
          rx: 1,
          ry: 1,
        },
        stem: {
          width: 10,
          height: 30,
          x: "calc(w / 2 - 5)",
          y: -30,
          stroke: "#333",
          strokeWidth: 2,
          fill: "#555",
        },
        control: {
          d: "M 0 0 C 0 -30 60 -30 60 0 Z",
          transform: "translate(calc(w / 2 - 30), -20)",
          stroke: "#333",
          strokeWidth: 2,
          rx: 5,
          ry: 5,
          fill: "#666",
        },
        label: {
          text: "Valve",
          textAnchor: "middle",
          textVerticalAnchor: "top",
          x: "calc(0.5*w)",
          y: "calc(h+10)",
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#350100",
        },
      },
      ports: {
        groups: {
          inout: {
            linkType: 'pipe',
            position: {
              name: "absolute",
              args: {
                x: "calc(w / 2)",
                y: "calc(h / 2)",
              },
            },
            markup: util.svg`
                             <rect @selector="pipeBody" />
                             <rect @selector="pipeEnd" />
                         `,
            // استفاده از مقادیر ثابت برای size
            size: { width: 50, height: 30 },
            attrs: {
              portRoot: {
                magnetSelector: "pipeEnd",
              },
              pipeBody: {
                width: "calc(w)",
                height: "calc(h)",
                y: "calc(h / -2)",
                fill: {
                  type: "linearGradient",
                  stops: [
                    { offset: "0%", color: "gray" },
                    { offset: "30%", color: "white" },
                    { offset: "70%", color: "white" },
                    { offset: "100%", color: "gray" },
                  ],
                  attrs: {
                    x1: "0%",
                    y1: "0%",
                    x2: "0%",
                    y2: "100%",
                  },
                },
              },
              pipeEnd: {
                width: 10,
                height: "calc(h)",
                y: "calc(h / -2)",
                stroke: "gray",
                strokeWidth: 3,
                fill: "white",
              },
            },
          },
        },
        items: [
          {
            id: "left",
            group: "inout",
            linkType: 'pipe',
            z: 0,
            attrs: {
              pipeBody: {
                x: "calc(-1 * w)",
              },
              pipeEnd: {
                x: "calc(-1 * w)",
              },
            },
          },
          {
            id: "right",
            group: "inout",
            linkType: 'pipe',
            z: 0,
            attrs: {
              pipeEnd: {
                x: "calc(w - 10)",
              },
            },
          },
        ],
      },
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
             <rect @selector="stem" />
             <path @selector="control" />
             <ellipse @selector="body" />
             <rect @selector="coverFrame" />
             <path @selector="liquid" />
             <rect @selector="cover" />
             <text @selector="label" />
         `;
  }
  // todo badan
  // اضافه کردن متد initialize برای مدیریت تغییر اندازه
  initialize(...args) {
    super.initialize(...args);
    this.on("change:size", this.updatePortsOnResize, this);

  }

  // متد جدید برای به‌روزرسانی پورت‌ها هنگام تغییر اندازه
  updatePortsOnResize() {
    const size = this.get("size");
    const scale = Math.min(size.width / 60, size.height / 60);

    // به‌روزرسانی اندازه پورت‌ها بر اساس مقیاس
    const ports = this.get("ports");
    const updatedItems = ports.items.map((port) => {
      // کپی از پورت موجود
      const updatedPort = { ...port };

      // تنظیم اندازه و موقعیت پورت بر اساس مقیاس
      if (port.id === "left") {
        updatedPort.attrs = {
          ...port.attrs,
          pipeEnd: {
            ...port.attrs.pipeEnd,
            width: 10 * scale,
            height: 30 * scale,
            y: -15 * scale, // محاسبه مستقیم به جای calc(h / -2)
            strokeWidth: 3 * scale,
            x: -50 * scale, // محاسبه مستقیم به جای calc(-1 * w)
          },
        };
      } else if (port.id === "right") {
        updatedPort.attrs = {
          ...port.attrs,
          pipeEnd: {
            ...port.attrs.pipeEnd,
            width: 10 * scale,
            height: 30 * scale,
            y: -15 * scale, // محاسبه مستقیم به جای calc(h / -2)
            x: size.width - 10 * scale, // محاسبه مستقیم به جای calc(w - 10)
            strokeWidth: 3 * scale,
          },
        };
      }

      return updatedPort;
    });

    // به‌روزرسانی پورت‌ها
    this.prop("ports/items", updatedItems);

    // به‌روزرسانی گروه پورت‌ها
    this.prop("ports/groups/pipes/size", {
      width: 50 * scale,
      height: 30 * scale,
    });
  }
}
