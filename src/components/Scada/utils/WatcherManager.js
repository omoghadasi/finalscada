import Swal from "sweetalert2";
import LinkManager from "./LinkManager";

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
}
