import Swal from "sweetalert2";

export default class StoreManager {
  constructor(store = null) {
    this.store = store;
  }

  // Set the store instance (can be called after initialization)
  setStore(store) {
    this.store = store;
  }

  // Get value from store
  getValue(storeKey) {
    if (!this.store) {
      // If no store is connected, return random value for testing
      return Math.random() * 100;
    }

    try {
      // Split the key path (e.g., "tank1.level" -> ["tank1", "level"])
      const keyParts = storeKey.split(".");

      // Get the state from store
      const state = this.store.getState();

      // Navigate through the state object
      let value = state;
      for (const part of keyParts) {
        value = value[part];
        if (value === undefined) {
          console.warn(`Store path ${storeKey} not found`);
          return 0;
        }
      }

      return value;
    } catch (error) {
      console.error(
        `Error getting value from store for key ${storeKey}:`,
        error
      );
      return 0;
    }
  }

  // Get available store keys for UI selection
  getAvailableStoreKeys() {
    // If no store is connected, return sample data
    if (!this.store) {
      return [
        { key: "tank1.level", label: "Tank 1 Level" },
        { key: "tank1.temperature", label: "Tank 1 Temperature" },
        { key: "tank2.level", label: "Tank 2 Level" },
        { key: "pump1.power", label: "Pump 1 Power" },
        { key: "valve1.open", label: "Valve 1 Open State" },
      ];
    }

    try {
      // Get the state from store
      const state = this.store.getState();

      // Build a list of available keys
      const keys = [];

      // Helper function to recursively traverse the state object
      const traverseObject = (obj, path = "") => {
        for (const key in obj) {
          const newPath = path ? `${path}.${key}` : key;

          if (typeof obj[key] === "object" && obj[key] !== null) {
            traverseObject(obj[key], newPath);
          } else {
            keys.push({
              key: newPath,
              label: newPath
                .replace(/\./g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            });
          }
        }
      };

      traverseObject(state);
      return keys;
    } catch (error) {
      console.error("Error getting store keys:", error);
      return [];
    }
  }

  // Generate HTML options for store keys
  getStoreSelectOptions() {
    const storeKeys = this.getAvailableStoreKeys();

    return storeKeys
      .map((item) => `<option value="store:${item.key}">${item.label}</option>`)
      .join("");
  }
}
