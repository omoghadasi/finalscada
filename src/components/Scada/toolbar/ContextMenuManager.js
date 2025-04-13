import Swal from "sweetalert2";

export default class ContextMenuManager {
  constructor(jointEl, graph, toolbarManager) {
    this.jointEl = jointEl;
    this.graph = graph;
    this.toolbarManager = toolbarManager;
    this.contextMenu = null;
    this.selectedElement = null;
  }

  init() {
    // ایجاد المنت منو
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "context-menu";
    this.contextMenu.style.position = "absolute";
    this.contextMenu.style.display = "none";
    this.contextMenu.style.backgroundColor = "#fff";
    this.contextMenu.style.border = "1px solid #ddd";
    this.contextMenu.style.borderRadius = "4px";
    this.contextMenu.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    this.contextMenu.style.zIndex = "1000";
    this.contextMenu.style.padding = "5px 0";
    document.body.appendChild(this.contextMenu);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // رویداد کلیک راست روی المنت‌ها
    this.jointEl.addEventListener(
      "contextmenu",
      this.handleContextMenu.bind(this)
    );

    // پنهان کردن منو با کلیک در هر جای دیگر
    document.addEventListener("click", () => {
      this.contextMenu.style.display = "none";
    });
  }

  handleContextMenu(event) {
    // جلوگیری از نمایش منوی پیش‌فرض مرورگر
    event.preventDefault();

    // پنهان کردن منو در ابتدا
    this.contextMenu.style.display = "none";

    // بررسی آیا کلیک روی یک المنت انجام شده است
    const paperOffset = this.jointEl.getBoundingClientRect();
    const x = event.clientX - paperOffset.left;
    const y = event.clientY - paperOffset.top;

    // پیدا کردن المنت زیر نقطه کلیک
    const elementView = this.graph.findModelsFromPoint({ x, y })[0];
    if (elementView) {
      this.selectedElement = elementView;

      // تنظیم موقعیت منو
      this.contextMenu.style.left = `${event.clientX}px`;
      this.contextMenu.style.top = `${event.clientY}px`;

      // پاک کردن محتوای قبلی منو
      this.contextMenu.innerHTML = "";

      this.buildMenuItems();
      this.contextMenu.style.display = "block";
    }
  }

  buildMenuItems() {
    // اضافه کردن گزینه "Connect Ports" به منوی راست کلیک
    this.addMenuItem("Connect Ports", () => {
      // ارسال المنت انتخاب شده به عنوان منبع
      this.toolbarManager.linkManager.setupPortLink(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    // اضافه کردن گزینه‌های مدیریت پورت
    this.addMenuItem("Add Port", () => {
      this.toolbarManager.portManager.setupPort(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    this.addMenuItem("Manage Ports", () => {
      this.toolbarManager.portManager.managePorts(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    if (this.selectedElement.getParentCell()) {
      // If the element is embedded, show the detach option
      this.addMenuItem("Detach from parent", () => {
        this.toolbarManager.elementUtils.detachElement(this.selectedElement);
        this.contextMenu.style.display = "none";
      });
    }

    // Add Watcher option for panels
    if (this.selectedElement.get("type") === "Panel") {
      this.addMenuItem("Set Watcher", () => {
        this.toolbarManager.watcherManager.setupWatcher(this.selectedElement);
        this.contextMenu.style.display = "none";
      });
    }

    // Element info option for all elements
    this.addMenuItem("Element Info", () => {
      Swal.fire({
        title: "Element Info",
        html: `Type: ${
          this.selectedElement.get("type") ||
          this.selectedElement.attributes.type
        }<br>
               ID: ${this.selectedElement.id}`,
        icon: "info",
      });
      this.contextMenu.style.display = "none";
    });
  }

  addMenuItem(text, onClick) {
    const menuItem = document.createElement("div");
    menuItem.className = "context-menu-item";
    menuItem.textContent = text;
    menuItem.style.padding = "8px 15px";
    menuItem.style.cursor = "pointer";
    menuItem.style.transition = "background-color 0.2s";

    menuItem.addEventListener("mouseover", () => {
      menuItem.style.backgroundColor = "#f0f0f0";
    });

    menuItem.addEventListener("mouseout", () => {
      menuItem.style.backgroundColor = "transparent";
    });

    menuItem.addEventListener("click", onClick);
    this.contextMenu.appendChild(menuItem);
  }
}
