import { dia } from "@joint/core";
import Swal from "sweetalert2";
export default class ToolbarManager {
  constructor(toolbarEl, jointEl, graph, namespace) {
    this.toolbarEl = toolbarEl;
    this.jointEl = jointEl;
    this.graph = graph;
    this.namespace = namespace;
    this.toolbarItems = [
      { type: "ButtonElement", label: "Button", icon: "🔘" },
      { type: "FormElement", label: "Form", icon: "📝" },
      { type: "LiquidTank", label: "Liquid Tank", icon: "🛢️" },
      { type: "ConicTank", label: "Conic Tank", icon: "⏺️" },
      { type: "Pump", label: "Pump", icon: "⚙️" },
      { type: "ControlValve", label: "Control Valve", icon: "🔄" },
      { type: "HandValve", label: "Hand Valve", icon: "🔧" },
      { type: "Join", label: "Join", icon: "➕" },
      { type: "Pipe", label: "Pipe", icon: "➖" },
      { type: "Zone", label: "Zone", icon: "🔲" },
      { type: "CircleProgressBar", label: "Progress Bar", icon: "⭕" },
      { type: "Panel", label: "Panel", icon: "📊" },
    ];
  }

  init() {
    // ایجاد پنل ابزار
    this.toolbarPaper = new dia.Paper({
      el: this.toolbarEl,
      width: 200,
      height: 800,
      model: new dia.Graph(),
      interactive: false,
      background: { color: "#f0f0f0" },
    });

    this.createToolbarItems();

    // اضافه کردن رویداد برای تشخیص جابجایی المنت‌ها
    this.setupElementMoveListener();

    // اضافه کردن رویداد کلیک راست
    this.setupContextMenu();
  }

  // متد جدید برای تنظیم منوی کلیک راست
  setupContextMenu() {
    // ایجاد المنت منو
    const contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    contextMenu.style.position = "absolute";
    contextMenu.style.display = "none";
    contextMenu.style.backgroundColor = "#fff";
    contextMenu.style.border = "1px solid #ddd";
    contextMenu.style.borderRadius = "4px";
    contextMenu.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    contextMenu.style.zIndex = "1000";
    contextMenu.style.padding = "5px 0";
    document.body.appendChild(contextMenu);

    // متغیر برای ذخیره المنت انتخاب شده
    let selectedElement = null;

    // رویداد کلیک راست روی المنت‌ها
    this.jointEl.addEventListener("contextmenu", (event) => {
      // جلوگیری از نمایش منوی پیش‌فرض مرورگر
      event.preventDefault();

      // پنهان کردن منو در ابتدا
      contextMenu.style.display = "none";

      // بررسی آیا کلیک روی یک المنت انجام شده است
      const paperOffset = this.jointEl.getBoundingClientRect();
      const x = event.clientX - paperOffset.left;
      const y = event.clientY - paperOffset.top;

      // پیدا کردن المنت زیر نقطه کلیک
      const elementView = this.graph.findModelsFromPoint({ x, y })[0];
      if (elementView) {
        selectedElement = elementView;

        // تنظیم موقعیت منو
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        // پاک کردن محتوای قبلی منو
        contextMenu.innerHTML = "";

        // اضافه کردن گزینه‌های منو بر اساس وضعیت المنت
        if (selectedElement.getParentCell()) {
          // اگر المنت embed شده باشد، گزینه حذف embed را نمایش می‌دهیم
          const detachOption = document.createElement("div");
          detachOption.className = "context-menu-item";
          detachOption.textContent = "Detach from parent";
          detachOption.style.padding = "8px 15px";
          detachOption.style.cursor = "pointer";
          detachOption.style.transition = "background-color 0.2s";

          detachOption.addEventListener("mouseover", () => {
            detachOption.style.backgroundColor = "#f0f0f0";
          });

          detachOption.addEventListener("mouseout", () => {
            detachOption.style.backgroundColor = "transparent";
          });

          detachOption.addEventListener("click", () => {
            this.detachElement(selectedElement);
            contextMenu.style.display = "none";
          });

          contextMenu.appendChild(detachOption);
          contextMenu.style.display = "block";
        }
        // اگر المنت embed نشده باشد، گزینه‌های دیگر را نمایش می‌دهیم

        // اضافه کردن گزینه Watcher برای پنل‌ها

        if (selectedElement.get("type") === "Panel") {
          const watcherOption = document.createElement("div");
          watcherOption.className = "context-menu-item";
          watcherOption.textContent = "Set Watcher";
          watcherOption.style.padding = "8px 15px";
          watcherOption.style.cursor = "pointer";
          watcherOption.style.transition = "background-color 0.2s";

          watcherOption.addEventListener("mouseover", () => {
            watcherOption.style.backgroundColor = "#f0f0f0";
          });

          watcherOption.addEventListener("mouseout", () => {
            watcherOption.style.backgroundColor = "transparent";
          });

          watcherOption.addEventListener("click", () => {
            this.setupWatcher(selectedElement);
            contextMenu.style.display = "none";
          });

          contextMenu.appendChild(watcherOption);
        }

        // گزینه اطلاعات المنت برای همه المنت‌ها
        const infoOption = document.createElement("div");
        infoOption.className = "context-menu-item";
        infoOption.textContent = "Element Info";
        infoOption.style.padding = "8px 15px";
        infoOption.style.cursor = "pointer";
        infoOption.style.transition = "background-color 0.2s";

        infoOption.addEventListener("mouseover", () => {
          infoOption.style.backgroundColor = "#f0f0f0";
        });

        infoOption.addEventListener("mouseout", () => {
          infoOption.style.backgroundColor = "transparent";
        });

        infoOption.addEventListener("click", () => {
          Swal.fire({
            title: "Element Info",
            html: `Type: ${
              selectedElement.get("type") || selectedElement.attributes.type
            }<br>
                     ID: ${selectedElement.id}`,
            icon: "info",
          });
          contextMenu.style.display = "none";
        });

        contextMenu.appendChild(infoOption);
        contextMenu.style.display = "block";
      }
    });

    // پنهان کردن منو با کلیک در هر جای دیگر
    document.addEventListener("click", () => {
      contextMenu.style.display = "none";
    });
  }

  // متد جدید برای تنظیم Watcher
  setupWatcher(panel) {
    // دریافت همه المنت‌های موجود در گراف به جز پنل فعلی
    const elements = this.graph.getElements().filter(
      (el) => el.id !== panel.id && !el.getParentCell() // فقط المنت‌های مستقل
    );

    // ساخت آرایه‌ای از گزینه‌های قابل انتخاب برای المنت‌ها
    const elementOptions = elements.map((el) => {
      const type = el.get("type") || el.attributes.type;
      return {
        id: el.id,
        type: type,
        label: `${type} (${el.id.substring(0, 8)})`,
      };
    });

    // ساخت HTML برای select المنت‌ها
    const elementSelectOptions = elementOptions
      .map((opt) => `<option value="element:${opt.id}">${opt.label}</option>`)
      .join("");

    // ساخت HTML برای select داده‌های store
    // فرض می‌کنیم که store دارای بخش‌های مختلفی است
    const storeSelectOptions = `
      <option value="store:tank1.level">Tank 1 Level</option>
      <option value="store:tank1.temperature">Tank 1 Temperature</option>
      <option value="store:tank2.level">Tank 2 Level</option>
      <option value="store:pump1.power">Pump 1 Power</option>
      <option value="store:valve1.open">Valve 1 Open State</option>
    `;

    // ترکیب گزینه‌های المنت و store
    const allSelectOptions = `
      <optgroup label="Elements">
        ${elementSelectOptions}
      </optgroup>
      <optgroup label="Store Data">
        ${storeSelectOptions}
      </optgroup>
    `;

    // نمایش modal با Swal
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
        // اضافه کردن رویداد برای تغییر منبع داده
        const dataSourceSelect = document.getElementById("data-source-select");
        const dataTypeContainer = document.getElementById(
          "data-type-container"
        );
        const dataTypeSelect = document.getElementById("data-type-select");

        dataSourceSelect.addEventListener("change", () => {
          const selectedValue = dataSourceSelect.value;

          // اگر یک المنت انتخاب شده باشد، نمایش گزینه‌های نوع داده
          if (selectedValue.startsWith("element:")) {
            const elementId = selectedValue.split(":")[1];
            const element = this.graph.getCell(elementId);

            if (element) {
              // پاک کردن گزینه‌های قبلی
              dataTypeSelect.innerHTML = "";

              // اضافه کردن گزینه‌های جدید بر اساس نوع المنت
              const dataTypes = this.getElementDataTypes(element);

              dataTypes.forEach((type) => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent =
                  type.charAt(0).toUpperCase() + type.slice(1);
                dataTypeSelect.appendChild(option);
              });

              // نمایش بخش انتخاب نوع داده
              dataTypeContainer.style.display = "block";
            }
          } else {
            // اگر داده از store انتخاب شده باشد، نیازی به انتخاب نوع داده نیست
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
          dataType = dataId.split(".")[1]; // مثلاً از "tank1.level" مقدار "level" را استخراج می‌کنیم
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

  // متد جدید برای دریافت انواع داده‌های قابل دسترس یک المنت
  getElementDataTypes(element) {
    const elementType = element.get("type") || element.attributes.type;

    // تعریف انواع داده برای هر نوع المنت
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

    // برگرداندن انواع داده برای المنت یا یک آرایه پیش‌فرض
    return dataTypeMap[elementType] || ["value"];
  }

  // متد جدید برای اتصال پنل به داده‌های store
  connectPanelToStore(panel, storeKey, dataType, updateInterval) {
    // قطع اتصال قبلی اگر وجود داشته باشد
    panel.stopListening();

    // حذف هر interval قبلی
    if (panel._storeWatcherInterval) {
      clearInterval(panel._storeWatcherInterval);
    }

    // تنظیم اطلاعات اتصال در پنل
    panel.set({
      watchTarget: `store:${storeKey}`,
      watchType: dataType,
      updateInterval: updateInterval,
    });

    // ایجاد یک تابع برای دریافت داده از store
    const updateFromStore = () => {
      // در اینجا باید به store واقعی متصل شوید
      // این یک مثال ساده است که مقادیر تصادفی تولید می‌کند

      // در یک برنامه واقعی، اینجا باید از store واقعی مقدار را دریافت کنید
      // مثلاً: const value = this.store.getState()[storeKey.split('.')[0]][storeKey.split('.')[1]];

      // برای مثال، مقدار تصادفی تولید می‌کنیم
      const value = Math.random() * 100;

      // تنظیم مقدار و رنگ مناسب بر اساس نوع داده
      let color = "#0EAD69"; // رنگ پیش‌فرض

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

      // تنظیم مقدار و رنگ در پنل
      panel.set({
        level: value, // استفاده از level برای نمایش همه مقادیر
        color: color,
        label: `${storeKey}: ${value.toFixed(2)}`,
      });
    };

    // اجرای اولیه
    updateFromStore();

    // تنظیم interval برای به‌روزرسانی مداوم
    panel._storeWatcherInterval = setInterval(updateFromStore, updateInterval);

    // نمایش پیام موفقیت
    Swal.fire({
      title: "Store Watcher Set",
      text: `Panel is now watching ${storeKey} from store`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  detachElement(element) {
    const parent = element.getParentCell();

    if (parent) {
      // ذخیره موقعیت فعلی (نسبی)
      const currentPos = element.position();

      // محاسبه موقعیت مطلق
      const parentPos = parent.position();
      const absoluteX = parentPos.x + currentPos.x;
      const absoluteY = parentPos.y + currentPos.y;

      // جدا کردن المنت از والد
      parent.unembed(element);

      // تنظیم موقعیت مطلق
      element.position(absoluteX, absoluteY);

      // حذف رویدادهای مربوط به والد
      if (element.get("type") === "Panel") {
        element.stopListening(parent);

        // حذف interval مربوط به store اگر وجود داشته باشد
        if (element._storeWatcherInterval) {
          clearInterval(element._storeWatcherInterval);
          delete element._storeWatcherInterval;
        }
      }

      // نمایش پیام موفقیت
      Swal.fire({
        title: "Success",
        text: "Element detached successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  // متد جدید برای تنظیم رویداد جابجایی المنت‌ها
  setupElementMoveListener() {
    // دسترسی به paper اصلی
    const paperEl = this.jointEl;

    // متغیر برای ذخیره المنت در حال حرکت
    let movingElement = null;

    // اضافه کردن رویداد mouseup به کل صفحه
    document.addEventListener("mouseup", () => {
      if (movingElement) {
        // بررسی نزدیکی به المنت‌های دیگر پس از پایان حرکت
        this.checkForNearbyElements(movingElement);
        movingElement = null;
      }
    });

    // رویداد تغییر موقعیت برای ذخیره المنت در حال حرکت
    this.graph.on("change:position", (element, position, opt) => {
      // اگر تغییر موقعیت به دلیل اتصال (embed) است، آن را نادیده بگیر
      if (opt.parentRelative) return;

      // ذخیره المنت در حال حرکت
      movingElement = element;
    });
  }

  createToolbarItems() {
    // اضافه کردن المنت‌ها به پنل ابزار
    let y = 20;
    this.toolbarItems.forEach((item) => {
      const element = document.createElement("div");
      element.className = "toolbar-item";
      element.innerHTML = `<span class="icon">${item.icon}</span> ${item.label}`;
      element.setAttribute("data-type", item.type);
      element.style.position = "absolute";
      element.style.top = `${y}px`;
      element.style.left = "10px";
      element.style.width = "160px";
      element.style.padding = "10px";
      element.style.backgroundColor = "#fff";
      element.style.border = "1px solid #ddd";
      element.style.borderRadius = "4px";
      element.style.cursor = "grab";
      element.style.userSelect = "none";

      this.toolbarEl.appendChild(element);
      y += 60;

      this.setupDragAndDrop(element);
    });
  }

  setupDragAndDrop(element) {
    element.addEventListener("mousedown", (event) => {
      const type = element.getAttribute("data-type");

      // ایجاد یک المنت موقت برای نمایش در حین درگ
      const dragElement = document.createElement("div");
      dragElement.className = "dragging-element";
      dragElement.innerHTML = element.innerHTML;
      dragElement.style.position = "absolute";
      dragElement.style.width = "160px";
      dragElement.style.padding = "10px";
      dragElement.style.backgroundColor = "#fff";
      dragElement.style.border = "1px solid #ddd";
      dragElement.style.borderRadius = "4px";
      dragElement.style.opacity = "0.8";
      dragElement.style.zIndex = "1000";
      dragElement.style.pointerEvents = "none";
      document.body.appendChild(dragElement);

      // تنظیم موقعیت اولیه المنت درگ
      const offsetX = event.clientX - element.getBoundingClientRect().left;
      const offsetY = event.clientY - element.getBoundingClientRect().top;

      // تابع برای آپدیت موقعیت المنت درگ
      const moveElement = (e) => {
        dragElement.style.left = `${e.clientX - offsetX}px`;
        dragElement.style.top = `${e.clientY - offsetY}px`;
      };

      // تابع برای پایان درگ
      const stopDrag = (e) => {
        document.removeEventListener("mousemove", moveElement);
        document.removeEventListener("mouseup", stopDrag);

        // بررسی آیا المنت روی کاغذ اصلی رها شده است
        const paperRect = this.jointEl.getBoundingClientRect();
        if (
          e.clientX > paperRect.left &&
          e.clientX < paperRect.right &&
          e.clientY > paperRect.top &&
          e.clientY < paperRect.bottom
        ) {
          // تبدیل موقعیت به مختصات کاغذ
          const x = e.clientX - paperRect.left;
          const y = e.clientY - paperRect.top;

          this.createNewElement(type, x, y);
        }

        // حذف المنت درگ
        document.body.removeChild(dragElement);
      };

      document.addEventListener("mousemove", moveElement);
      document.addEventListener("mouseup", stopDrag);

      // جلوگیری از رفتار پیش‌فرض
      event.preventDefault();
    });
  }

  createNewElement(type, x, y) {
    // ایجاد المنت جدید در گراف
    let newElement;

    switch (type) {
      case "ButtonElement":
        newElement = new this.namespace.ButtonElement({ position: { x, y } });
        newElement.on("button:click", () => {
          console.log("Button clicked!");
        });
        break;
      case "FormElement":
        newElement = new this.namespace.FormElement({ position: { x, y } });
        newElement.on("form:submit", (data) => {
          console.log("Form submitted:", data);
        });
        break;
      case "LiquidTank":
        newElement = new this.namespace.LiquidTank({ position: { x, y } });
        break;
      case "ConicTank":
        newElement = new this.namespace.ConicTank({ position: { x, y } });
        break;
      case "Pump":
        newElement = new this.namespace.Pump({ position: { x, y } });
        newElement.power = 1;
        break;
      case "ControlValve":
        newElement = new this.namespace.ControlValve({
          position: { x, y },
          open: 1,
        });
        break;
      case "HandValve":
        newElement = new this.namespace.HandValve({
          position: { x, y },
          open: 1,
        });
        break;
      case "Join":
        newElement = new this.namespace.Join({ position: { x, y } });
        break;
      case "Zone":
        newElement = new this.namespace.Zone({ position: { x, y } });
        break;
      case "CircleProgressBar":
        newElement = new this.namespace.CircleProgressBar();
        newElement.updateSize({ width: 75, height: 75 });
        newElement.position(x, y);
        break;
      case "Panel":
        newElement = new this.namespace.Panel({ position: { x, y } });
        break;
      case "Pipe":
        // برای پایپ نیاز به منبع و مقصد داریم، پس فعلاً چیزی اضافه نمی‌کنیم
        alert(
          'برای ایجاد پایپ، ابتدا دو المنت را انتخاب کنید و سپس از منوی راست کلیک گزینه "اتصال" را انتخاب کنید.'
        );
        break;
      default:
        console.warn("نوع المنت نامشخص:", type);
        break;
    }

    if (newElement) {
      newElement.addTo(this.graph);

      // بررسی نزدیکی به المنت‌های دیگر
      this.checkForNearbyElements(newElement);
    }
  }

  // اضافه کردن متد جدید برای بررسی نزدیکی به المنت‌های دیگر
  checkForNearbyElements(newElement) {
    // فاصله مجاز برای تشخیص نزدیکی (به پیکسل)
    const proximityThreshold = 50;

    // دریافت همه المنت‌های موجود در گراف
    const elements = this.graph.getElements();

    // اگر المنت قبلاً به المنت دیگری متصل است، آن را نادیده بگیر
    if (newElement.getParentCell()) return;

    // بررسی هر المنت به جز المنت جدید
    for (const element of elements) {
      if (element.id === newElement.id) continue;

      // اگر المنت قبلاً به المنت دیگری متصل است، آن را نادیده بگیر
      if (element.getParentCell()) continue;

      // محاسبه فاصله بین دو المنت
      const newPos = newElement.position();
      const existingPos = element.position();
      const distance = Math.sqrt(
        Math.pow(newPos.x - existingPos.x, 2) +
          Math.pow(newPos.y - existingPos.y, 2)
      );

      // اگر فاصله کمتر از حد آستانه بود
      if (distance < proximityThreshold) {
        // بررسی سازگاری المنت‌ها برای اتصال
        if (this.areCompatibleForEmbedding(element, newElement)) {
          // نمایش پیام تأیید
          Swal.fire({
            title: "Connect Elements",
            text: `Do you want to connect ${
              newElement.get("type") || newElement.attributes.type
            } to ${element.get("type") || element.attributes.type}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          }).then((result) => {
            if (result.isConfirmed) {
              // Connect elements if user confirms
              this.embedElements(element, newElement);
            }
          });
          // فقط یک اتصال در هر زمان
          break;
        }
      }
    }
  }

  // بررسی سازگاری دو المنت برای اتصال
  areCompatibleForEmbedding(parent, child) {
    // لیست ترکیب‌های مجاز
    const compatiblePairs = [
      { parent: "LiquidTank", child: "Panel" },
      { parent: "ConicTank", child: "Panel" },
      { parent: "Zone", child: "Panel" },
      // می‌توانید ترکیب‌های دیگر را اضافه کنید
    ];

    const parentType = parent.get("type");
    const childType = child.get("type");

    return compatiblePairs.some(
      (pair) => pair.parent === parentType && pair.child === childType
    );
  }

  // اتصال دو المنت به هم
  embedElements(parent, child) {
    // تنظیم موقعیت نسبی
    const parentPos = parent.position();
    const childPos = child.position();

    // محاسبه موقعیت نسبی
    const relativeX = childPos.x - parentPos.x;
    const relativeY = childPos.y - parentPos.y;

    // اتصال المنت‌ها
    parent.embed(child);

    // تنظیم موقعیت نسبی
    child.position(relativeX, relativeY, { parentRelative: true });

    // اگر المنت فرزند یک پنل است، می‌توانیم رویدادهای مربوط به تغییرات والد را به آن متصل کنیم
    if (child.get("type") === "Panel") {
      if (
        parent.get("type") === "LiquidTank" ||
        parent.get("type") === "ConicTank"
      ) {
        // اتصال رویداد تغییر سطح
        child.listenTo(parent, "change:level", (_, level) => {
          const color =
            level > 80 ? "#ED2637" : level < 20 ? "#FFD23F" : "#0EAD69";
          child.set({ level, color });
        });
      }
    }
  }

  // متد برای اتصال پنل به المنت
  connectPanelToElement(panel, targetElement, dataType) {
    // قطع اتصال قبلی اگر وجود داشته باشد
    panel.stopListening();

    // حذف هر interval قبلی
    if (panel._storeWatcherInterval) {
      clearInterval(panel._storeWatcherInterval);
      delete panel._storeWatcherInterval;
    }

    // تنظیم اطلاعات اتصال در پنل
    panel.set({
      watchTarget: targetElement.id,
      watchType: dataType,
    });

    // تنظیم رویداد مناسب بر اساس نوع داده
    const eventName = `change:${dataType}`;

    // اتصال رویداد
    panel.listenTo(targetElement, eventName, (_, value) => {
      // تنظیم مقدار و رنگ مناسب بر اساس نوع داده
      let color = "#0EAD69"; // رنگ پیش‌فرض

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

      // تنظیم مقدار و رنگ در پنل
      panel.set({
        level: value, // استفاده از level برای نمایش همه مقادیر
        color: color,
        label: `${dataType}: ${value.toFixed(2)}`,
      });
    });

    // دریافت مقدار فعلی و اعمال آن
    const currentValue = targetElement.get(dataType);
    if (currentValue !== undefined) {
      // شبیه‌سازی تغییر برای اعمال مقدار اولیه
      targetElement.trigger(eventName, targetElement, currentValue);
    }

    // نمایش پیام موفقیت
    Swal.fire({
      title: "Watcher Set",
      text: `Panel is now watching ${dataType} of ${targetElement.get("type")}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }
}
