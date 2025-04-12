import Swal from "sweetalert2";
import * as joint from "@joint/core";

export default class LinkManager {
  constructor(graph) {
    this.graph = graph;

    // تنظیم قابلیت‌های تعاملی paper
    if (graph.paper) {
      this.setupPaperInteractivity(graph.paper);
    }
  }

  // متد برای تنظیم قابلیت‌های تعاملی paper
  setupPaperInteractivity(paper) {
    // فعال کردن تعامل با لینک‌ها
    paper.options.interactive = paper.options.interactive || {};
    paper.options.interactive.linkMove = true;
    paper.options.interactive.vertexAdd = true;
    paper.options.interactive.vertexMove = true;
    paper.options.interactive.vertexRemove = true;
    paper.options.interactive.arrowheadMove = true;

    // فعال کردن امکان اتصال لینک‌ها
    paper.options.linkPinning = true;

    // نمایش نقاط اتصال هنگام حرکت ماوس روی لینک
    paper.options.highlighting = paper.options.highlighting || {};
    paper.options.highlighting.magnetAvailable = {
      name: "stroke",
      options: {
        padding: 6,
        attrs: {
          "stroke-width": 3,
          stroke: "#4666E5",
        },
      },
    };
  }

  createLink(sourceId, targetId, linkType) {
    const source = this.graph.getCell(sourceId);
    const target = this.graph.getCell(targetId);

    if (!source || !target) {
      Swal.fire({
        title: "Error",
        text: "Source or target element not found",
        icon: "error",
      });
      return;
    }

    // تنظیمات مشترک برای همه لینک‌ها
    const commonLinkOptions = {
      source: { id: sourceId },
      target: { id: targetId },
      router: { name: "manhattan", args: { padding: 10 } },
      connector: { name: "rounded", args: { radius: 10 } },
      vertices: [],
      interactive: true,
    };

    // Create link based on type
    let link;

    switch (linkType) {
      case "pipe":
        link = this.createPipeLink(commonLinkOptions);
        break;
      case "electrical":
        link = this.createElectricalLink(commonLinkOptions);
        break;
      case "data":
        link = this.createDataLink(commonLinkOptions);
        break;
      case "signal":
        link = this.createSignalLink(commonLinkOptions);
        break;
      default:
        link = this.createDefaultLink(commonLinkOptions);
    }

    // Add link to the graph
    this.graph.addCell(link);

    // اگر paper موجود باشد، ابزارهای ویرایش لینک را فعال کنیم
    if (this.graph.paper) {
      const linkView = link.findView(this.graph.paper);
      if (linkView) {
        linkView.addTools(
          new joint.dia.ToolsView({
            tools: [
              new joint.linkTools.Vertices(),
              new joint.linkTools.Segments(),
              new joint.linkTools.SourceArrowhead(),
              new joint.linkTools.TargetArrowhead(),
            ],
          })
        );
      }
    }

    // Show success message
    Swal.fire({
      title: "Link Created",
      text: `Link created between ${source.get("type")} and ${target.get(
        "type"
      )}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    return link;
  }

  createPipeLink(options) {
    return new joint.shapes.standard.Link({
      ...options,
      attrs: {
        line: {
          stroke: "#3498db",
          strokeWidth: 5,
          targetMarker: { type: "none" },
        },
      },
      labels: [
        {
          position: 0.5,
          attrs: {
            text: { text: "Pipe" },
          },
        },
      ],
    });
  }

  createElectricalLink(options) {
    return new joint.shapes.standard.Link({
      ...options,
      attrs: {
        line: {
          stroke: "#e74c3c",
          strokeWidth: 3,
          strokeDasharray: "5 2",
          targetMarker: { type: "circle", fill: "#e74c3c" },
        },
      },
      labels: [
        {
          position: 0.5,
          attrs: {
            text: { text: "Electrical" },
          },
        },
      ],
    });
  }

  createDataLink(options) {
    return new joint.shapes.standard.Link({
      ...options,
      attrs: {
        line: {
          stroke: "#2ecc71",
          strokeWidth: 2,
          strokeDasharray: "3 3",
          targetMarker: {
            type: "path",
            d: "M 10 -5 0 0 10 5 z",
            fill: "#2ecc71",
          },
        },
      },
      labels: [
        {
          position: 0.5,
          attrs: {
            text: { text: "Data" },
          },
        },
      ],
    });
  }

  createSignalLink(options) {
    return new joint.shapes.standard.Link({
      ...options,
      attrs: {
        line: {
          stroke: "#9b59b6",
          strokeWidth: 2,
          targetMarker: {
            type: "path",
            d: "M 10 -5 0 0 10 5 z",
            fill: "#9b59b6",
          },
        },
      },
      labels: [
        {
          position: 0.5,
          attrs: {
            text: { text: "Signal" },
          },
        },
      ],
    });
  }

  createDefaultLink(options) {
    return new joint.shapes.standard.Link({
      ...options,
      attrs: {
        line: {
          stroke: "#333333",
          strokeWidth: 2,
          targetMarker: { type: "path", d: "M 10 -5 0 0 10 5 z" },
        },
      },
    });
  }
}
