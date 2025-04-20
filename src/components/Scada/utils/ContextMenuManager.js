import Swal from "sweetalert2";

export default class ContextMenuManager {
  constructor(
    jointEl,
    graph,
    paper,
    linkManager,
    portManager,
    elementUtils,
    watcherManager
  ) {
    this.jointEl = jointEl;
    this.graph = graph;
    this.paper = paper;
    this.linkManager = linkManager;
    this.portManager = portManager;
    this.elementUtils = elementUtils;
    this.watcherManager = watcherManager;
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
    this.handleLinkContextMenu();
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
    // دریافت مقدار translate و scale
    const translate = this.paper.translate();
    const scale = this.paper.scale();
    const tx = translate.tx;
    const ty = translate.ty;
    const sx = scale.sx;
    const sy = scale.sy;

    // بررسی آیا کلیک روی یک المنت انجام شده است
    const paperOffset = this.jointEl.getBoundingClientRect();
    const x = (event.clientX - paperOffset.left - tx) / sx;
    const y = (event.clientY - paperOffset.top - ty) / sy;

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
      this.linkManager.setupPortLink(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    // اضافه کردن گزینه‌های مدیریت پورت
    this.addMenuItem("Add Port", () => {
      this.portManager.setupPort(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    this.addMenuItem("Manage Ports", () => {
      this.portManager.managePorts(this.selectedElement);
      this.contextMenu.style.display = "none";
    });

    if (this.selectedElement.getParentCell()) {
      // If the element is embedded, show the detach option
      this.addMenuItem("Detach from parent", () => {
        this.elementUtils.detachElement(this.selectedElement);
        this.contextMenu.style.display = "none";
      });
    }

    // Add Watcher option for panels
    if (this.selectedElement.get("type") === "Panel") {
      this.addMenuItem("Set Watcher", () => {
        this.watcherManager.setupWatcher(this.selectedElement);
        this.contextMenu.style.display = "none";
      });
    }

    // Element info option for all elements
    this.addMenuItem("Element Info", () => {
      Swal.fire({
        title: "Element Info",
        html: `Type: ${this.selectedElement.get("type") ||
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

  handleLinkContextMenu(event) {
    this.paper.on("link:contextmenu", (linkView, evt) => {
      evt.preventDefault();

      const link = linkView.model;
      const { clientX: x, clientY: y } = evt;

      const menu = document.createElement("div");
      menu.style.position = "absolute";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.background = "#fff";
      menu.style.border = "1px solid #ddd";
      menu.style.padding = "10px";
      menu.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
      menu.style.zIndex = 1000;

      menu.innerHTML = `
    <div style="cursor: pointer; margin-bottom: 5px;" id="delete-link">Delete Link</div>
    <div style="cursor: pointer;" id="edit-link">Edit Link</div>
  `;

      document.body.appendChild(menu);

      menu.addEventListener("click", (e) => {
        if (e.target.id === "delete-link") {
          link.remove(); // حذف لینک
        } else if (e.target.id === "edit-link") {
          Swal.fire({
            title: "Edit Link",
            input: "text",
            inputValue: link.attr("line/stroke"),
            showCancelButton: true,
            confirmButtonText: "Save",
          }).then((result) => {
            if (result.isConfirmed) {
              link.attr("line/stroke", result.value); // تغییر رنگ لینک
            }
          });
        }
        document.body.removeChild(menu);
      });

      document.addEventListener(
        "click",
        () => {
          if (document.body.contains(menu)) {
            document.body.removeChild(menu);
          }
        },
        { once: true }
      );
    });
  }
}
