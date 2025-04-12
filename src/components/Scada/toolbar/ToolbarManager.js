import { dia } from "@joint/core";

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
      width: 180,
      height: 800,
      model: new dia.Graph(),
      interactive: false,
      background: { color: "#f0f0f0" },
    });

    this.createToolbarItems();
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
    }
  }
}
