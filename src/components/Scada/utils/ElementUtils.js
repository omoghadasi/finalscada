import Swal from "sweetalert2";
import { dia, shapes } from "@joint/core";

export default class ElementUtils {
  constructor(graph) {
    this.graph = graph;
    this.initRotationTool();
    this.initResizeTool(); // اضافه کردن ابزار تغییر اندازه
  }

  initRotationTool() {
    dia.ElementView.prototype.showRotateHandle = function () {
      const element = this.model;
      const paper = this.paper;

      // حذف هندل قبلی
      if (this.rotateHandle) {
        this.rotateHandle.remove();
        document.removeEventListener(
          "mousedown",
          this._removeRotateHandleListener
        );
        delete this._removeRotateHandleListener;
      }

      // ایجاد دستگیره چرخش
      const elementBBox = element.getBBox();
      const centerX = elementBBox.x + elementBBox.width / 2;
      const handleY = elementBBox.y - 20;

      // ایجاد گروه SVG
      const rotateHandleGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      rotateHandleGroup.classList.add("rotate-handle-group");

      // ایجاد دستگیره و خط اتصال
      const rotateHandle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      rotateHandle.setAttribute("cx", centerX);
      rotateHandle.setAttribute("cy", handleY);
      rotateHandle.setAttribute("r", 8);
      rotateHandle.setAttribute("fill", "#4285F4");
      rotateHandle.setAttribute("cursor", "crosshair");

      const connector = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      connector.setAttribute("x1", centerX);
      connector.setAttribute("y1", elementBBox.y);
      connector.setAttribute("x2", centerX);
      connector.setAttribute("y2", handleY);
      connector.setAttribute("stroke", "#4285F4");
      connector.setAttribute("stroke-width", 1);
      connector.setAttribute("stroke-dasharray", "3,3");

      rotateHandleGroup.appendChild(connector);
      rotateHandleGroup.appendChild(rotateHandle);
      paper.svg.appendChild(rotateHandleGroup);
      this.rotateHandle = rotateHandleGroup;

      // متغیرهای چرخش
      let rotating = false;
      let startAngle = 0;
      let currentRotation = element.get("angle") || 0;

      // رویدادهای چرخش
      const onMouseDown = (evt) => {
        evt.stopPropagation();
        rotating = true;

        const elementCenter = {
          x: centerX,
          y: elementBBox.y + elementBBox.height / 2,
        };

        const mousePosition = paper.clientToLocalPoint({
          x: evt.clientX,
          y: evt.clientY,
        });

        startAngle =
          Math.atan2(
            mousePosition.y - elementCenter.y,
            mousePosition.x - elementCenter.x
          ) *
          (180 / Math.PI);

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (evt) => {
        if (!rotating) return;

        const elementCenter = {
          x: centerX,
          y: elementBBox.y + elementBBox.height / 2,
        };

        const mousePosition = paper.clientToLocalPoint({
          x: evt.clientX,
          y: evt.clientY,
        });

        const currentAngle =
          Math.atan2(
            mousePosition.y - elementCenter.y,
            mousePosition.x - elementCenter.x
          ) *
          (180 / Math.PI);

        const angleDelta = currentAngle - startAngle;
        const newAngle = (currentRotation + angleDelta) % 360;

        // چرخش المان
        element.rotate(newAngle, { absolute: true });

        // به‌روزرسانی موقعیت دستگیره
        const newBBox = element.getBBox();
        const newCenterX = newBBox.x + newBBox.width / 2;
        rotateHandle.setAttribute("cx", newCenterX);
        rotateHandle.setAttribute("cy", newBBox.y - 20);
        connector.setAttribute("x1", newCenterX);
        connector.setAttribute("y1", newBBox.y);
        connector.setAttribute("x2", newCenterX);
        connector.setAttribute("y2", newBBox.y - 20);

        // به‌روزرسانی لینک‌ها
        this.updateConnectedLinks(element, paper);

        startAngle = currentAngle;
        currentRotation = newAngle;
      };

      const onMouseUp = () => {
        if (rotating) {
          rotating = false;
          this.updateConnectedLinks(element, paper);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        }
      };

      // اتصال رویدادها
      rotateHandle.addEventListener("mousedown", onMouseDown);
      rotateHandle.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        const touch = evt.touches[0];
        onMouseDown(
          new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
          })
        );
      });

      // حذف دستگیره هنگام کلیک خارج
      const removeRotateHandle = (evt) => {
        if (
          this.rotateHandle &&
          !rotating &&
          evt.target !== rotateHandle &&
          evt.target !== element.findView(paper).el
        ) {
          this.rotateHandle.remove();
          this.rotateHandle = null;
          document.removeEventListener("mousedown", removeRotateHandle);
        }
      };

      this._removeRotateHandleListener = removeRotateHandle;
      setTimeout(() => {
        document.addEventListener("mousedown", removeRotateHandle);
      }, 100);
    };

    // متد کمکی برای به‌روزرسانی لینک‌ها
    dia.ElementView.prototype.updateConnectedLinks = function (element, paper) {
      const connectedLinks = paper.model.getConnectedLinks(element);
      if (connectedLinks.length > 0) {
        connectedLinks.forEach((link) => {
          link.findView(paper).update();
        });
      }
    };
  }

  initResizeTool() {
    dia.ElementView.prototype.showResizeHandles = function () {
      const element = this.model;
      const paper = this.paper;

      // حذف دستگیره‌های قبلی
      if (this.resizeHandles) {
        this.resizeHandles.remove();
        document.removeEventListener(
          "mousedown",
          this._removeResizeHandlesListener
        );
        delete this._removeResizeHandlesListener;
      }

      // بررسی اینکه آیا المنت قابلیت تغییر اندازه دارد
      if (element.get("resizable") === false) return;

      // ایجاد گروه SVG برای دستگیره‌ها
      const resizeHandlesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      resizeHandlesGroup.classList.add("resize-handles-group");

      // دریافت مختصات المنت
      const elementBBox = element.getBBox();
      const x = elementBBox.x;
      const y = elementBBox.y;
      const width = elementBBox.width;
      const height = elementBBox.height;

      // موقعیت دستگیره‌ها
      const handlePositions = [
        { x: x, y: y, cursor: "nw-resize", position: "top-left" },
        { x: x + width, y: y, cursor: "ne-resize", position: "top-right" },
        { x: x, y: y + height, cursor: "sw-resize", position: "bottom-left" },
        {
          x: x + width,
          y: y + height,
          cursor: "se-resize",
          position: "bottom-right",
        },
      ];

      // ایجاد دستگیره‌ها
      const handles = [];
      handlePositions.forEach((pos) => {
        const handle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        handle.setAttribute("x", pos.x - 5);
        handle.setAttribute("y", pos.y - 5);
        handle.setAttribute("width", 10);
        handle.setAttribute("height", 10);
        handle.setAttribute("fill", "#4285F4");
        handle.setAttribute("stroke", "#ffffff");
        handle.setAttribute("stroke-width", 1);
        handle.setAttribute("cursor", pos.cursor);
        handle.dataset.position = pos.position;

        resizeHandlesGroup.appendChild(handle);
        handles.push(handle);
      });

      paper.svg.appendChild(resizeHandlesGroup);
      this.resizeHandles = resizeHandlesGroup;

      // متغیرهای تغییر اندازه
      let resizing = false;
      let startX, startY, startWidth, startHeight;
      let currentHandle = null;

      // رویدادهای تغییر اندازه
      const onMouseDown = (evt) => {
        evt.stopPropagation();
        resizing = true;
        currentHandle = evt.target;

        // ذخیره مقادیر اولیه
        startX = evt.clientX;
        startY = evt.clientY;
        startWidth = elementBBox.width;
        startHeight = elementBBox.height;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (evt) => {
        if (!resizing) return;

        // محاسبه تغییرات
        const dx = evt.clientX - startX;
        const dy = evt.clientY - startY;

        // تبدیل به مختصات محلی
        const localPoint = paper.clientToLocalPoint({
          x: evt.clientX,
          y: evt.clientY,
        });

        // محاسبه اندازه جدید بر اساس موقعیت دستگیره
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = elementBBox.x;
        let newY = elementBBox.y;

        const position = currentHandle.dataset.position;

        if (position === "top-right") {
          newWidth = startWidth + dx;
          newHeight = startHeight - dy;
          newY = elementBBox.y + dy;
        } else if (position === "bottom-right") {
          newWidth = startWidth + dx;
          newHeight = startHeight + dy;
        } else if (position === "bottom-left") {
          newWidth = startWidth - dx;
          newHeight = startHeight + dy;
          newX = elementBBox.x + dx;
        } else if (position === "top-left") {
          newWidth = startWidth - dx;
          newHeight = startHeight - dy;
          newX = elementBBox.x + dx;
          newY = elementBBox.y + dy;
        }

        // اعمال حداقل اندازه
        newWidth = Math.max(30, newWidth);
        newHeight = Math.max(30, newHeight);

        // تغییر اندازه و موقعیت المنت
        element.resize(newWidth, newHeight);
        element.position(newX, newY);

        // به‌روزرسانی موقعیت دستگیره‌ها
        this.updateResizeHandles();

        // به‌روزرسانی لینک‌ها
        this.updateConnectedLinks(element, paper);
      };

      const onMouseUp = () => {
        if (resizing) {
          resizing = false;
          this.updateConnectedLinks(element, paper);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        }
      };

      // اتصال رویدادها
      handles.forEach((handle) => {
        handle.addEventListener("mousedown", onMouseDown);
        handle.addEventListener("touchstart", (evt) => {
          evt.preventDefault();
          const touch = evt.touches[0];
          onMouseDown(
            new MouseEvent("mousedown", {
              clientX: touch.clientX,
              clientY: touch.clientY,
            })
          );
        });
      });

      // متد به‌روزرسانی موقعیت دستگیره‌ها
      this.updateResizeHandles = function () {
        const newBBox = element.getBBox();
        const x = newBBox.x;
        const y = newBBox.y;
        const width = newBBox.width;
        const height = newBBox.height;

        const handlePositions = [
          { x: x, y: y, position: "top-left" },
          { x: x + width, y: y, position: "top-right" },
          { x: x, y: y + height, position: "bottom-left" },
          { x: x + width, y: y + height, position: "bottom-right" },
        ];

        // به‌روزرسانی موقعیت هر دستگیره
        const handles = resizeHandlesGroup.querySelectorAll("rect");
        handles.forEach((handle, index) => {
          const pos = handlePositions[index];
          handle.setAttribute("x", pos.x - 5);
          handle.setAttribute("y", pos.y - 5);
        });
      };

      // حذف دستگیره‌ها هنگام کلیک خارج
      const removeResizeHandles = (evt) => {
        if (
          this.resizeHandles &&
          !resizing &&
          !Array.from(handles).includes(evt.target) &&
          evt.target !== element.findView(paper).el
        ) {
          this.resizeHandles.remove();
          this.resizeHandles = null;
          document.removeEventListener("mousedown", removeResizeHandles);
        }
      };

      this._removeResizeHandlesListener = removeResizeHandles;
      setTimeout(() => {
        document.addEventListener("mousedown", removeResizeHandles);
      }, 100);
    };
  }

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
}
