import { dia, util } from "@joint/core";
export default class LiquidTank extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "LiquidTank",
      size: {
        width: 160,
        height: 300,
      },
      attrs: {
        root: {
          magnetSelector: "body",
        },
        legs: {
          fill: "none",
          stroke: "#350100",
          strokeWidth: 8,
          strokeLinecap: "round",
          d: "M 20 calc(h) l -5 10 M calc(w - 20) calc(h) l 5 10",
        },
        body: {
          stroke: "gray",
          strokeWidth: 4,
          x: 0,
          y: 0,
          width: "calc(w)",
          height: "calc(h)",
          rx: 120,
          ry: 10,
          fill: {
            type: "linearGradient",
            stops: [
              { offset: "0%", color: "gray" },
              { offset: "30%", color: "white" },
              { offset: "70%", color: "white" },
              { offset: "100%", color: "gray" },
            ],
          },
        },
        top: {
          x: 0,
          y: 20,
          width: "calc(w)",
          height: 20,
          fill: "none",
          stroke: "gray",
          strokeWidth: 2,
        },
        label: {
          text: "Tank 1",
          textAnchor: "middle",
          textVerticalAnchor: "top",
          x: "calc(w / 2)",
          y: "calc(h + 10)",
          fontSize: 14,
          fontFamily: "sans-serif",
          fill: "#350100",
        },
      },
      // تعریف گروه‌های پورت
      ports: {
        groups: {
          input: {
            position: {
              name: "left",
              args: { dx: 0 }, // امکان تنظیم فاصله افقی
            },
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#3498db",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refX: 12, // فاصله متن از دایره
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
          output: {
            position: {
              name: "right",
              args: { dx: 0 }, // امکان تنظیم فاصله افقی
            },
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#e74c3c",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refX: -12, // فاصله متن از دایره (منفی برای سمت چپ)
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
          // اضافه کردن گروه‌های جدید برای موقعیت‌های مختلف
          top: {
            position: {
              name: "top",
              args: { dy: 0 }, // امکان تنظیم فاصله عمودی
            },
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#9b59b6",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refY: 12, // فاصله متن از دایره
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
          bottom: {
            position: {
              name: "bottom",
              args: { dy: 0 }, // امکان تنظیم فاصله عمودی
            },
            attrs: {
              portBody: {
                r: 6,
                magnet: true,
                stroke: "#2ecc71",
                strokeWidth: 2,
                fill: "#fff",
              },
              portLabel: {
                fontSize: 10,
                fill: "#333",
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                refY: -12, // فاصله متن از دایره (منفی برای بالا)
              },
            },
            markup: [
              {
                tagName: "circle",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portLabel",
              },
            ],
          },
        },
      },
    };
  }

  preinitialize() {
    this.markup = util.svg/* xml */ `
               <path @selector="legs"/>
               <rect @selector="body"/>
               <rect @selector="top"/>
               <text @selector="label" />
           `;

    // تعریف markup برای پورت‌ها
    this.portMarkup = [
      {
        tagName: "circle",
        selector: "portBody", // Changed from 'circle' to 'portBody'
      },
      {
        tagName: "text",
        selector: "portLabel", // Changed from 'text' to 'portLabel'
      },
    ];
  }

  get level() {
    return this.get("level") || 0;
  }

  set level(level) {
    const newLevel = Math.max(0, Math.min(100, level));
    this.set("level", newLevel);
  }
}
