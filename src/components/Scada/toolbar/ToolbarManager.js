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
      width: 180,
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
        } else {
          // اگر المنت embed نشده باشد، گزینه‌های دیگر را نمایش می‌دهیم
          // می‌توانید گزینه‌های دیگر را در اینجا اضافه کنید
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
      }
    });

    // پنهان کردن منو با کلیک در هر جای دیگر
    document.addEventListener("click", () => {
      contextMenu.style.display = "none";
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

      // حذف رویدادهای مربوط به والد
      if (element.get("type") === "Panel") {
        element.stopListening(parent);
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
}
