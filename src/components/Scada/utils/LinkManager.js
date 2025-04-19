import Swal from "sweetalert2";
import * as joint from "@joint/core";
import Links from "../shapes/Links";

export default class LinkManager {
  constructor(graph, toolbarManager) {
    this.graph = graph;
    this.toolbarManager = toolbarManager;

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

  /**
   * نمایش مدال برای ایجاد لینک بین پورت‌های دو المنت
   * @param {Object} sourceElement - المنت مبدأ
   */
  setupPortLink(sourceElement) {
    if (!sourceElement) {
      Swal.fire({
        title: "Error",
        text: "No source element selected",
        icon: "error",
      });
      return;
    }

    // دریافت پورت‌های المنت مبدأ
    const sourcePorts = sourceElement.getPorts() || [];

    if (sourcePorts.length === 0) {
      Swal.fire({
        title: "No Ports",
        text: "Source element has no ports. Would you like to add one?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Add Port",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // اگر PortManager در دسترس است، از آن استفاده می‌کنیم
          if (this.toolbarManager && this.toolbarManager.portManager) {
            this.toolbarManager.portManager.setupPort(sourceElement);
          } else {
            Swal.fire({
              title: "Error",
              text: "Port Manager not available",
              icon: "error",
            });
          }
        }
      });
      return;
    }

    // فیلتر کردن پورت‌های خروجی برای المنت مبدأ
    const outputPorts = sourcePorts.filter(
      (port) => port.group === "output" || port.group === "inout"
    );

    if (outputPorts.length === 0) {
      Swal.fire({
        title: "No Output Ports",
        text: "Source element has no output ports. Would you like to add one?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Add Port",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.toolbarManager && this.toolbarManager.portManager) {
            this.toolbarManager.portManager.setupPort(sourceElement);
          }
        }
      });
      return;
    }

    // دریافت همه المنت‌های موجود در گراف به جز المنت مبدأ
    const targetElements = this.graph
      .getElements()
      .filter((el) => el.id !== sourceElement.id && !el.getParentCell());

    if (targetElements.length === 0) {
      Swal.fire({
        title: "No Target Elements",
        text: "There are no other elements to connect to",
        icon: "info",
      });
      return;
    }

    // ایجاد HTML برای گزینه‌های پورت مبدأ
    const sourcePortOptions = outputPorts
      .map((port) => {
        const linkType = port.linkType || "default";
        const portColor = this.getLinkTypeColor(linkType);
        return `<option value="${port.id}" data-link-type="${linkType}">${port.id} (${linkType}) - ${port.group}</option>`;
      })
      .join("");

    // ایجاد HTML برای گزینه‌های المنت مقصد
    const targetElementOptions = targetElements
      .map((el) => {
        const type = el.get("type") || el.attributes.type;
        return `<option value="${el.id}">${type} (${el.id.substring(
          0,
          8
        )})</option>`;
      })
      .join("");

    // نمایش modal با Swal
    Swal.fire({
      title: "Create Link Between Ports",
      html: `
        <div style="text-align: left; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
          <strong>Source Element:</strong> ${sourceElement.get(
        "type"
      )} (${sourceElement.id.substring(0, 8)})
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="source-port" style="display: block; margin-bottom: 5px; font-weight: bold;">Source Port:</label>
          <select id="source-port" class="swal2-select" style="width: 100%;">
            ${sourcePortOptions}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="target-element" style="display: block; margin-bottom: 5px; font-weight: bold;">Target Element:</label>
          <select id="target-element" class="swal2-select" style="width: 100%;">
            ${targetElementOptions}
          </select>
        </div>
        <div id="target-port-container" style="text-align: left; margin-bottom: 15px; display: none;">
          <label for="target-port" style="display: block; margin-bottom: 5px; font-weight: bold;">Target Port:</label>
          <select id="target-port" class="swal2-select" style="width: 100%;">
            <option value="">Select target element first</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Create Link",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const sourcePortSelect = document.getElementById("source-port");
        const targetElementSelect = document.getElementById("target-element");
        const targetPortContainer = document.getElementById(
          "target-port-container"
        );
        const targetPortSelect = document.getElementById("target-port");

        // رویداد تغییر المنت مقصد
        targetElementSelect.addEventListener("change", () => {
          const targetElementId = targetElementSelect.value;
          const targetElement = this.graph.getCell(targetElementId);

          if (targetElement) {
            // دریافت نوع لینک پورت مبدأ انتخاب شده
            const selectedSourcePort =
              sourcePortSelect.options[sourcePortSelect.selectedIndex];
            const sourceLinkType =
              selectedSourcePort.getAttribute("data-link-type");

            // دریافت پورت‌های المنت مقصد
            const targetPorts = targetElement.getPorts() || [];

            // فیلتر کردن پورت‌های ورودی با نوع لینک مشابه
            const compatiblePorts = targetPorts.filter(
              (port) =>
                (port.group === "input" || port.group === "inout") &&
                (port.linkType === sourceLinkType ||
                  !port.linkType ||
                  !sourceLinkType)
            );

            if (compatiblePorts.length > 0) {
              // ایجاد گزینه‌های پورت مقصد
              const targetPortOptions = compatiblePorts
                .map((port) => {
                  const linkType = port.linkType || "default";
                  return `<option value="${port.id}">${port.id} (${linkType}) - ${port.group}</option>`;
                })
                .join("");

              targetPortSelect.innerHTML = targetPortOptions;
              targetPortContainer.style.display = "block";
            } else {
              targetPortSelect.innerHTML =
                '<option value="">No compatible ports found</option>';
              targetPortContainer.style.display = "block";
            }
          }
        });
      },
      preConfirm: () => {
        const sourcePortId = document.getElementById("source-port").value;
        const targetElementId = document.getElementById("target-element").value;
        const targetPortId = document.getElementById("target-port").value;

        // اعتبارسنجی انتخاب‌ها
        if (!sourcePortId) {
          Swal.showValidationMessage("Please select a source port");
          return false;
        }

        if (!targetElementId) {
          Swal.showValidationMessage("Please select a target element");
          return false;
        }

        if (!targetPortId) {
          Swal.showValidationMessage("Please select a target port");
          return false;
        }

        return { sourcePortId, targetElementId, targetPortId };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { sourcePortId, targetElementId, targetPortId } = result.value;
        this.createPortLink(
          sourceElement.id,
          sourcePortId,
          targetElementId,
          targetPortId
        );
      }
    });
  }

  /**
   * ایجاد لینک بین پورت‌های دو المنت
   * @param {string} sourceElementId - شناسه المنت مبدأ
   * @param {string} sourcePortId - شناسه پورت مبدأ
   * @param {string} targetElementId - شناسه المنت مقصد
   * @param {string} targetPortId - شناسه پورت مقصد
   */
  createPortLink(sourceElementId, sourcePortId, targetElementId, targetPortId) {
    const sourceElement = this.graph.getCell(sourceElementId);
    const targetElement = this.graph.getCell(targetElementId);

    if (!sourceElement || !targetElement) {
      Swal.fire({
        title: "Error",
        text: "Source or target element not found",
        icon: "error",
      });
      return;
    }

    // دریافت پورت‌های مبدأ و مقصد
    const sourcePort = sourceElement.getPort(sourcePortId);
    const targetPort = targetElement.getPort(targetPortId);

    if (!sourcePort || !targetPort) {
      Swal.fire({
        title: "Error",
        text: "Source or target port not found",
        icon: "error",
      });
      return;
    }

    // تعیین نوع لینک بر اساس نوع پورت‌ها
    const linkType = sourcePort.linkType || targetPort.linkType || "default";

    // تنظیمات لینک
    const linkOptions = {
      source: {
        id: sourceElementId,
        port: sourcePortId,
      },
      target: {
        id: targetElementId,
        port: targetPortId,
      },
      router: { name: "manhattan", args: { padding: 10 } },
      connector: { name: "rounded", args: { radius: 10 } },
      vertices: [],
      interactive: true,
    };

    // ایجاد لینک بر اساس نوع
    let link;
    switch (linkType) {
      case "pipe":
        link = new Links.Pipe(linkOptions);
        break;
      default:
        link = this.createDefaultLink(linkOptions);
    }

    // افزودن لینک به گراف
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

    // نمایش پیام موفقیت
    Swal.fire({
      title: "Link Created",
      text: `Link created between ${sourceElement.get(
        "type"
      )} and ${targetElement.get("type")}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    return link;
  }

  // متد کمکی برای دریافت رنگ متناسب با نوع لینک
  getLinkTypeColor(linkType) {
    switch (linkType) {
      case "pipe":
        return "#3498db"; // آبی
      case "electrical":
        return "#e74c3c"; // قرمز
      case "data":
        return "#2ecc71"; // سبز
      case "signal":
        return "#9b59b6"; // بنفش
      default:
        return "#7f8c8d"; // خاکستری
    }
  }
}
