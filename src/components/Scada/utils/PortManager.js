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

    // تعریف موقعیت‌های پورت
    const portPositions = [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
    ];

    // ایجاد HTML برای گزینه‌های نوع پورت
    const portTypeOptions = portTypes
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // ایجاد HTML برای گزینه‌های نوع لینک
    const linkTypeOptions = linkTypes
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // ایجاد HTML برای گزینه‌های موقعیت پورت
    const portPositionOptions = portPositions
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
                  `<li>${port.id} (${port.group || "default"}) - Link Type: ${
                    port.linkType || "default"
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
            ${portPositionOptions}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="port-label" style="display: block; margin-bottom: 5px; font-weight: bold;">Port Label (optional):</label>
          <input id="port-label" class="swal2-input" placeholder="Enter port label" style="width: 100%;">
        </div>
        <div id="position-preview" style="text-align: center; margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
          <div style="width: 100px; height: 100px; background-color: #eee; position: relative; margin: 0 auto; border-radius: 4px;">
            <div id="port-preview" style="width: 12px; height: 12px; background-color: #3498db; border-radius: 50%; position: absolute; left: 0; top: 50%; transform: translate(-50%, -50%);"></div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Add Port",
      cancelButtonText: "Cancel",
      didOpen: () => {
        // پیش‌نمایش موقعیت پورت
        const portPositionSelect = document.getElementById("port-position");
        const portPreview = document.getElementById("port-preview");

        // تابع به‌روزرسانی پیش‌نمایش
        const updatePreview = () => {
          const position = portPositionSelect.value;

          switch (position) {
            case "left":
              portPreview.style.left = "0";
              portPreview.style.top = "50%";
              portPreview.style.transform = "translate(-50%, -50%)";
              break;
            case "right":
              portPreview.style.left = "100%";
              portPreview.style.top = "50%";
              portPreview.style.transform = "translate(-50%, -50%)";
              break;
            case "top":
              portPreview.style.left = "50%";
              portPreview.style.top = "0";
              portPreview.style.transform = "translate(-50%, -50%)";
              break;
            case "bottom":
              portPreview.style.left = "50%";
              portPreview.style.top = "100%";
              portPreview.style.transform = "translate(-50%, -50%)";
              break;
          }
        };

        // به‌روزرسانی اولیه پیش‌نمایش
        updatePreview();

        // اضافه کردن رویداد تغییر برای به‌روزرسانی پیش‌نمایش
        portPositionSelect.addEventListener("change", updatePreview);

        // به‌روزرسانی رنگ پیش‌نمایش بر اساس نوع لینک
        const linkTypeSelect = document.getElementById("link-type");
        linkTypeSelect.addEventListener("change", () => {
          const linkType = linkTypeSelect.value;
          let color;

          switch (linkType) {
            case "pipe":
              color = "#3498db"; // آبی
              break;
            case "electrical":
              color = "#e74c3c"; // قرمز
              break;
            case "data":
              color = "#2ecc71"; // سبز
              break;
            case "signal":
              color = "#9b59b6"; // بنفش
              break;
            default:
              color = "#7f8c8d"; // خاکستری
          }

          portPreview.style.backgroundColor = color;
        });
      },
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
   * افزودن پورت به المنت
   * @param {Object} element - المنت مورد نظر
   * @param {String} portId - شناسه پورت
   * @param {String} portType - نوع پورت (input, output, inout)
   * @param {String} linkType - نوع لینک
   * @param {String} position - موقعیت پورت (left, right, top, bottom, leftTop, ...)
   * @param {String} label - برچسب پورت
   */
  addPortToElement(element, portId, portType, linkType, position, label) {
    if (!element) return;

    // Get color based on link type
    const color = this.getLinkTypeColor(linkType);

    // Base port configuration
    const portConfig = {
      id: portId,
      attrs: {
        portBody: {
          fill: "#fff",
          stroke: color,
          strokeWidth: 2,
          r: 6,
          magnet: true,
        },
        portLabel: {
          text: label || portId,
          fill: "#333",
          fontSize: 10,
        },
      },
    };

    // Handle different positions
    switch (position) {
      case "left":
        element.addPort({
          ...portConfig,
          group: "input",
        });
        break;
      case "right":
        element.addPort({
          ...portConfig,
          group: "output",
        });
        break;
      case "top":
        element.addPort({
          ...portConfig,
          group: "top",
        });
        break;
      case "bottom":
        element.addPort({
          ...portConfig,
          group: "bottom",
        });
        break;
      default:
        element.addPort({
          ...portConfig,
          group: portType,
        });
    }
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
}
