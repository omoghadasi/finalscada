import Swal from "sweetalert2";

export default class PortManager {
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * نمایش مدال برای افزودن پورت جدید به یک المنت
   * @param {Object} element - المنت مورد نظر
   */
  setupPort(element) {
    if (!element) {
      Swal.fire({
        title: "Error",
        text: "No element selected",
        icon: "error",
      });
      return;
    }

    // تعریف انواع پورت
    const portTypes = [
      { value: "input", label: "Input" },
      { value: "output", label: "Output" },
      { value: "inout", label: "Input/Output" },
    ];

    // تعریف انواع لینک
    const linkTypes = [
      { value: "default", label: "Default" },
      { value: "pipe", label: "Pipe" },
      { value: "electrical", label: "Electrical" },
      { value: "data", label: "Data" },
      { value: "signal", label: "Signal" },
    ];

    // ایجاد HTML برای گزینه‌های نوع پورت
    const portTypeOptions = portTypes
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // ایجاد HTML برای گزینه‌های نوع لینک
    const linkTypeOptions = linkTypes
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // دریافت پورت‌های موجود المنت
    const existingPorts = element.getPorts() || [];

    // ایجاد HTML برای نمایش پورت‌های موجود
    let existingPortsHtml = "";
    if (existingPorts.length > 0) {
      existingPortsHtml = `
        <div style="text-align: left; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
          <strong>Existing Ports:</strong>
          <ul style="margin-top: 5px; padding-left: 20px;">
            ${existingPorts
          .map(
            (port) =>
              `<li>${port.id} (${port.group || "default"}) - Link Type: ${port.linkType || "default"
              }</li>`
          )
          .join("")}
          </ul>
        </div>
      `;
    }

    // نمایش modal با Swal
    Swal.fire({
      title: "Add Port to Element",
      html: `
        ${existingPortsHtml}
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="port-id" style="display: block; margin-bottom: 5px; font-weight: bold;">Port ID:</label>
          <input id="port-id" class="swal2-input" placeholder="Enter port ID" style="width: 100%;">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="port-type" style="display: block; margin-bottom: 5px; font-weight: bold;">Port Type:</label>
          <select id="port-type" class="swal2-select" style="width: 100%;">
            ${portTypeOptions}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="link-type" style="display: block; margin-bottom: 5px; font-weight: bold;">Link Type:</label>
          <select id="link-type" class="swal2-select" style="width: 100%;">
            ${linkTypeOptions}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="port-position" style="display: block; margin-bottom: 5px; font-weight: bold;">Port Position:</label>
          <select id="port-position" class="swal2-select" style="width: 100%;">
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="port-label" style="display: block; margin-bottom: 5px; font-weight: bold;">Port Label (optional):</label>
          <input id="port-label" class="swal2-input" placeholder="Enter port label" style="width: 100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Add Port",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const portId = document.getElementById("port-id").value;
        const portType = document.getElementById("port-type").value;
        const linkType = document.getElementById("link-type").value;
        const portPosition = document.getElementById("port-position").value;
        const portLabel = document.getElementById("port-label").value;

        // اعتبارسنجی ورودی‌ها
        if (!portId) {
          Swal.showValidationMessage("Port ID is required");
          return false;
        }

        // بررسی تکراری نبودن شناسه پورت
        if (existingPorts.some((port) => port.id === portId)) {
          Swal.showValidationMessage("Port ID already exists");
          return false;
        }

        return { portId, portType, linkType, portPosition, portLabel };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { portId, portType, linkType, portPosition, portLabel } =
          result.value;
        this.addPortToElement(
          element,
          portId,
          portType,
          linkType,
          portPosition,
          portLabel
        );
      }
    });
  }

  /**
   * افزودن پورت جدید به المنت
   * @param {Object} element - المنت مورد نظر
   * @param {string} portId - شناسه پورت
   * @param {string} portType - نوع پورت (input, output, inout)
   * @param {string} linkType - نوع لینک (default, pipe, electrical, data, signal)
   * @param {string} position - موقعیت پورت (left, right, top, bottom)
   * @param {string} label - برچسب پورت (اختیاری)
   */
  addPortToElement(element, portId, portType, linkType, position, label) {
    // تنظیم رنگ پورت بر اساس نوع لینک
    let portColor;
    switch (linkType) {
      case "pipe":
        portColor = "#3498db"; // آبی
        break;
      case "electrical":
        portColor = "#e74c3c"; // قرمز
        break;
      case "data":
        portColor = "#2ecc71"; // سبز
        break;
      case "signal":
        portColor = "#9b59b6"; // بنفش
        break;
      default:
        portColor = "#7f8c8d"; // خاکستری
    }
    const portPosition = this.handlePortPosition(position, element);

    // تنظیمات پورت
    const portConfig = {
      id: portId,
      group: portType,
      linkType: linkType, // ذخیره نوع لینک در پورت
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: portColor,
          strokeWidth: 2,
          fill: "#fff",
        },
        text: {
          text: label || portId,
          fill: "#333",
          fontSize: 10,
          textAnchor: "middle",
          yAlignment: "middle",
          pointerEvents: "none",
        },
      },
      args: {
        x: portPosition.x,
        y: portPosition.y,
      },
    };

    // افزودن پورت به المنت
    element.addPort(portConfig);

    // نمایش پیام موفقیت
    Swal.fire({
      title: "Port Added",
      text: `Port "${portId}" (${linkType}) added to element`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * نمایش مدال برای مدیریت پورت‌های یک المنت
   * @param {Object} element - المنت مورد نظر
   */
  managePorts(element) {
    if (!element) {
      Swal.fire({
        title: "Error",
        text: "No element selected",
        icon: "error",
      });
      return;
    }

    // دریافت پورت‌های موجود المنت
    const existingPorts = element.getPorts() || [];

    if (existingPorts.length === 0) {
      Swal.fire({
        title: "No Ports",
        text: "This element has no ports. Would you like to add one?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Add Port",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          this.setupPort(element);
        }
      });
      return;
    }

    // ایجاد HTML برای نمایش پورت‌های موجود
    const portsListHtml = existingPorts
      .map(
        (port, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
        <div>
          <strong>${port.id}</strong> (${port.group || "default"})
          - Link Type: <span style="color: ${this.getLinkTypeColor(
          port.linkType
        )}">${port.linkType || "default"}</span>
          ${port.attrs.text?.text ? ` - ${port.attrs.text.text}` : ""}
        </div>
        <button class="delete-port-btn swal2-styled swal2-cancel" data-port-index="${index}" style="padding: 5px 10px; font-size: 12px; margin: 0;">Delete</button>
      </div>
    `
      )
      .join("");

    // نمایش modal با Swal
    Swal.fire({
      title: "Manage Ports",
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
            ${portsListHtml}
          </div>
        </div>
        <button id="add-new-port-btn" class="swal2-styled swal2-confirm" style="margin-top: 10px;">Add New Port</button>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Close",
      didOpen: () => {
        // اضافه کردن رویداد برای دکمه افزودن پورت جدید
        document
          .getElementById("add-new-port-btn")
          .addEventListener("click", () => {
            Swal.close();
            setTimeout(() => {
              this.setupPort(element);
            }, 300);
          });

        // اضافه کردن رویداد برای دکمه‌های حذف پورت
        document.querySelectorAll(".delete-port-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const portIndex = parseInt(btn.getAttribute("data-port-index"));
            const port = existingPorts[portIndex];

            Swal.fire({
              title: "Delete Port",
              text: `Are you sure you want to delete port "${port.id}"?`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Delete",
              cancelButtonText: "Cancel",
            }).then((result) => {
              if (result.isConfirmed) {
                element.removePort(port.id);
                Swal.fire({
                  title: "Port Deleted",
                  text: `Port "${port.id}" has been deleted`,
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                }).then(() => {
                  this.managePorts(element);
                });
              }
            });
          });
        });
      },
    });
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


  handlePortPosition(position, element) {
    // Get element size
    const elementSize = element.size();
    const width = elementSize.width;
    const height = elementSize.height;

    switch (position) {
      case "left":
        return {
          x: 0, // Left edge
          y: Math.max(0, Math.round(Math.random() * height)), // Centered vertically
        };
      case "right":
        return {
          x: width, // Right edge  
          y: Math.max(0, Math.round(Math.random() * height)), // Centered vertically
        };
      case "top":
        return {
          x: Math.max(0, Math.round(Math.random() * width)), // Centered horizontally
          y: 0 // Top edge
        };
      case "bottom":
        return {
          x: Math.max(0, Math.round(Math.random() * width)), // Centered horizontally
          y: height // Bottom edge
        };
      default:
        return { x: 0, y: 0 };
    }
  }
}
