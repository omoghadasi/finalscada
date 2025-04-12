import Swal from "sweetalert2";
import * as joint from "@joint/core";

export default class WatcherManager {
  constructor(graph, storeManager) {
    this.graph = graph;
    this.storeManager = storeManager;
  }

  setupWatcher(panel) {
    // Get all elements in the graph except the current panel
    const elements = this.graph.getElements().filter(
      (el) => el.id !== panel.id && !el.getParentCell() // Only independent elements
    );

    // Create an array of selectable options for elements
    const elementOptions = elements.map((el) => {
      const type = el.get("type") || el.attributes.type;
      return {
        id: el.id,
        type: type,
        label: `${type} (${el.id.substring(0, 8)})`,
      };
    });

    // Create HTML for element select options
    const elementSelectOptions = elementOptions
      .map((opt) => `<option value="element:${opt.id}">${opt.label}</option>`)
      .join("");

    // Get store select options from StoreManager
    const storeSelectOptions = this.storeManager.getStoreSelectOptions();

    // Combine element and store options
    const allSelectOptions = `
      <optgroup label="Elements">
        ${elementSelectOptions}
      </optgroup>
      <optgroup label="Store Data">
        ${storeSelectOptions}
      </optgroup>
    `;

    // Show modal with Swal
    Swal.fire({
      title: "Set Panel Watcher",
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="data-source-select" style="display: block; margin-bottom: 5px; font-weight: bold;">Select Data Source:</label>
          <select id="data-source-select" class="swal2-select" style="width: 100%;">
            ${allSelectOptions}
          </select>
        </div>
        <div id="data-type-container" style="text-align: left; display: none;">
          <label for="data-type-select" style="display: block; margin-bottom: 5px; font-weight: bold;">Select Data Type:</label>
          <select id="data-type-select" class="swal2-select" style="width: 100%;">
          </select>
        </div>
        <div style="text-align: left; margin-top: 15px;">
          <label for="update-interval" style="display: block; margin-bottom: 5px; font-weight: bold;">Update Interval (ms):</label>
          <input type="number" id="update-interval" class="swal2-input" value="1000" min="100" max="10000" style="width: 100%;">
        </div>
      `,
      didOpen: () => {
        // Add event for data source change
        const dataSourceSelect = document.getElementById("data-source-select");
        const dataTypeContainer = document.getElementById(
          "data-type-container"
        );
        const dataTypeSelect = document.getElementById("data-type-select");

        dataSourceSelect.addEventListener("change", () => {
          const selectedValue = dataSourceSelect.value;

          // If an element is selected, show data type options
          if (selectedValue.startsWith("element:")) {
            const elementId = selectedValue.split(":")[1];
            const element = this.graph.getCell(elementId);

            if (element) {
              // Clear previous options
              dataTypeSelect.innerHTML = "";

              // Add new options based on element type
              const dataTypes = this.getElementDataTypes(element);

              dataTypes.forEach((type) => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent =
                  type.charAt(0).toUpperCase() + type.slice(1);
                dataTypeSelect.appendChild(option);
              });

              // Show data type selection
              dataTypeContainer.style.display = "block";
            }
          } else {
            // If store data is selected, no need for data type selection
            dataTypeContainer.style.display = "none";
          }
        });
      },
      showCancelButton: true,
      confirmButtonText: "Set Watcher",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const dataSourceValue =
          document.getElementById("data-source-select").value;
        const updateInterval = document.getElementById("update-interval").value;

        let dataSource, dataId, dataType;

        if (dataSourceValue.startsWith("element:")) {
          dataSource = "element";
          dataId = dataSourceValue.split(":")[1];
          dataType = document.getElementById("data-type-select").value;
        } else if (dataSourceValue.startsWith("store:")) {
          dataSource = "store";
          dataId = dataSourceValue.split(":")[1];
          dataType = dataId.split(".")[1]; // Extract "level" from "tank1.level"
        }

        return { dataSource, dataId, dataType, updateInterval };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { dataSource, dataId, dataType, updateInterval } = result.value;

        if (dataSource === "element") {
          const targetElement = this.graph.getCell(dataId);
          if (targetElement) {
            this.connectPanelToElement(panel, targetElement, dataType);
          }
        } else if (dataSource === "store") {
          this.connectPanelToStore(
            panel,
            dataId,
            dataType,
            parseInt(updateInterval)
          );
        }
      }
    });
  }

  getElementDataTypes(element) {
    const elementType = element.get("type") || element.attributes.type;

    // Define data types for each element type
    const dataTypeMap = {
      LiquidTank: ["level", "temperature", "pressure"],
      ConicTank: ["level", "temperature", "pressure"],
      Pump: ["power", "flow", "status"],
      ControlValve: ["open", "flow"],
      HandValve: ["open", "flow"],
      Zone: ["status", "temperature", "humidity"],
      Join: ["flow"],
      CircleProgressBar: ["value", "percentage"],
    };

    // Return data types for the element or a default array
    return dataTypeMap[elementType] || ["value"];
  }

  connectPanelToElement(panel, targetElement, dataType) {
    // Disconnect previous connections if any
    panel.stopListening();

    // Clear any previous store watcher interval
    if (panel._storeWatcherInterval) {
      clearInterval(panel._storeWatcherInterval);
      delete panel._storeWatcherInterval;
    }

    // Set connection info in the panel
    panel.set({
      watchTarget: targetElement.id,
      watchType: dataType,
    });

    // Set up appropriate event based on data type
    const eventName = `change:${dataType}`;

    // Connect event
    panel.listenTo(targetElement, eventName, (_, value) => {
      // Set appropriate value and color based on data type
      let color = "#0EAD69"; // Default color

      if (dataType === "level") {
        color = value > 80 ? "#ED2637" : value < 20 ? "#FFD23F" : "#0EAD69";
      } else if (dataType === "pressure") {
        color = value > 80 ? "#ED2637" : "#1446A0";
      } else if (dataType === "temperature") {
        color = value > 70 ? "#ED2637" : value < 30 ? "#1446A0" : "#FFD23F";
      } else if (dataType === "flow") {
        color = value > 0 ? "#0EAD69" : "#ED2637";
      } else if (dataType === "power") {
        color = value > 0 ? "#0EAD69" : "#ED2637";
      } else if (dataType === "open") {
        color = value > 0 ? "#0EAD69" : "#ED2637";
      }

      // Set value and color in the panel
      panel.set({
        level: value, // Use level for displaying all values
        color: color,
        label: `${dataType}: ${value.toFixed(2)}`,
      });
    });

    // Get current value and apply it
    const currentValue = targetElement.get(dataType);
    if (currentValue !== undefined) {
      // Simulate change to apply initial value
      targetElement.trigger(eventName, targetElement, currentValue);
    }

    // Show success message
    Swal.fire({
      title: "Watcher Set",
      text: `Panel is now watching ${dataType} of ${targetElement.get("type")}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  connectPanelToStore(panel, storeKey, dataType, updateInterval) {
    // Disconnect previous connections if any
    panel.stopListening();

    // Clear any previous store watcher interval
    if (panel._storeWatcherInterval) {
      clearInterval(panel._storeWatcherInterval);
    }

    // Set connection info in the panel
    panel.set({
      watchTarget: `store:${storeKey}`,
      watchType: dataType,
      updateInterval: updateInterval,
    });

    // Create a function to get data from store
    const updateFromStore = () => {
      // Get value from store manager
      const value = this.storeManager.getValue(storeKey);

      // Set appropriate color based on data type
      let color = "#0EAD69"; // Default color

      if (dataType === "level") {
        color = value > 80 ? "#ED2637" : value < 20 ? "#FFD23F" : "#0EAD69";
      } else if (dataType === "temperature") {
        color = value > 70 ? "#ED2637" : value < 30 ? "#1446A0" : "#FFD23F";
      } else if (dataType === "pressure") {
        color = value > 80 ? "#ED2637" : "#1446A0";
      } else if (
        dataType === "flow" ||
        dataType === "power" ||
        dataType === "open"
      ) {
        color = value > 0 ? "#0EAD69" : "#ED2637";
      }

      // Set value and color in the panel
      panel.set({
        level: value, // Use level for displaying all values
        color: color,
        label: `${storeKey}: ${value.toFixed(2)}`,
      });
    };

    // Initial execution
    updateFromStore();

    // Set interval for continuous updates
    panel._storeWatcherInterval = setInterval(updateFromStore, updateInterval);

    // Show success message
    Swal.fire({
      title: "Store Watcher Set",
      text: `Panel is now watching ${storeKey} from store`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  // Add this method to the WatcherManager class
  // تغییر متد setupLink برای پذیرفتن المنت منبع
  setupLink(sourceElement) {
    // دریافت شناسه المنت منبع
    const sourceId = sourceElement ? sourceElement.id : null;

    // دریافت همه المنت‌های موجود در گراف
    const elements = this.graph.getElements().filter(
      (el) => !el.getParentCell() && (!sourceId || el.id !== sourceId) // فقط المنت‌های مستقل و غیر از منبع
    );

    // ایجاد آرایه‌ای از گزینه‌های قابل انتخاب برای المنت‌ها
    const elementOptions = elements.map((el) => {
      const type = el.get("type") || el.attributes.type;
      return {
        id: el.id,
        type: type,
        label: `${type} (${el.id.substring(0, 8)})`,
      };
    });

    // ایجاد HTML برای گزینه‌های انتخاب المنت
    const elementSelectOptions = elementOptions
      .map((opt) => `<option value="${opt.id}">${opt.label}</option>`)
      .join("");

    // تعریف انواع لینک
    const linkTypes = [
      { value: "default", label: "Default" },
      { value: "pipe", label: "Pipe" },
      { value: "electrical", label: "Electrical" },
      { value: "data", label: "Data" },
      { value: "signal", label: "Signal" },
    ];

    // ایجاد HTML برای گزینه‌های نوع لینک
    const linkTypeOptions = linkTypes
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("");

    // نمایش اطلاعات المنت منبع
    const sourceInfo = sourceElement
      ? `<div style="text-align: left; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
  <strong>Source Element:</strong> ${sourceElement.get(
    "type"
  )} (${sourceElement.id.substring(0, 8)})
  </div>`
      : `<div style="text-align: left; margin-bottom: 15px;">
  <label for="source-element" style="display: block; margin-bottom: 5px; font-weight: bold;">Source Element:</label>
  <select id="source-element" class="swal2-select" style="width: 100%;">
  ${elementSelectOptions}
  </select>
  </div>`;

    // نمایش modal با Swal
    Swal.fire({
      title: "Create Link Between Elements",
      html: `
  ${sourceInfo}
  <div style="text-align: left; margin-bottom: 15px;">
  <label for="target-element" style="display: block; margin-bottom: 5px; font-weight: bold;">Target Element:</label>
  <select id="target-element" class="swal2-select" style="width: 100%;">
  ${elementSelectOptions}
  </select>
  </div>
  <div style="text-align: left; margin-bottom: 15px;">
  <label for="link-type" style="display: block; margin-bottom: 5px; font-weight: bold;">Link Type:</label>
  <select id="link-type" class="swal2-select" style="width: 100%;">
  ${linkTypeOptions}
  </select>
  </div>
  `,
      showCancelButton: true,
      confirmButtonText: "Create Link",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        // اگر المنت منبع از قبل تعیین شده باشد، از آن استفاده می‌کنیم
        // در غیر این صورت، از مقدار انتخاب شده در فرم استفاده می‌کنیم
        const finalSourceId =
          sourceId || document.getElementById("source-element").value;
        const targetId = document.getElementById("target-element").value;
        const linkType = document.getElementById("link-type").value;

        // اعتبارسنجی که منبع و مقصد متفاوت باشند
        if (finalSourceId === targetId) {
          Swal.showValidationMessage(
            "Source and target must be different elements"
          );
          return false;
        }

        return { sourceId: finalSourceId, targetId, linkType };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { sourceId, targetId, linkType } = result.value;
        this.createLink(sourceId, targetId, linkType);
      }
    });
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

    // Create link based on type
    let link;

    switch (linkType) {
      case "pipe":
        link = new joint.shapes.standard.Link({
          source: { id: sourceId },
          target: { id: targetId },
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
        break;
      case "electrical":
        link = new joint.shapes.standard.Link({
          source: { id: sourceId },
          target: { id: targetId },
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
        break;
      case "data":
        link = new joint.shapes.standard.Link({
          source: { id: sourceId },
          target: { id: targetId },
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
        break;
      case "signal":
        link = new joint.shapes.standard.Link({
          source: { id: sourceId },
          target: { id: targetId },
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
        break;
      default:
        link = new joint.shapes.standard.Link({
          source: { id: sourceId },
          target: { id: targetId },
          attrs: {
            line: {
              stroke: "#333333",
              strokeWidth: 2,
              targetMarker: { type: "path", d: "M 10 -5 0 0 10 5 z" },
            },
          },
        });
    }

    // Add link to the graph
    this.graph.addCell(link);

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
  }
}
