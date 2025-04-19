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

      // دریافت مقدار translate
      const translate = paper.translate();
      const tx = translate.tx;
      const ty = translate.ty;
      const scale = paper.scale();
      const sx = scale.sx;
      const sy = scale.sy;


      // ایجاد دستگیره چرخش
      const elementBBox = element.getBBox();
      const centerX = (elementBBox.x + ((elementBBox.width / 2) + tx)) * sx;
      const handleY = (elementBBox.y - 20 + ty) * sy;

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
      connector.setAttribute("y1", (elementBBox.y + ty) * sy);
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

        // به‌روزرسانی موقعیت دستگیره‌ها با زاویه جدید
        if (this.resizeHandles) {
          this.updateResizeHandles();
        }

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
    // اضافه کردن متد scaleResize به پروتوتایپ dia.Element
    dia.Element.prototype.scaleResize = function (width, height, opt = {}) {
      // دریافت اندازه فعلی
      const currentSize = this.get("size");

      // محاسبه نسبت مقیاس
      const scaleX = width / currentSize.width;
      const scaleY = height / currentSize.height;

      // ذخیره موقعیت فعلی
      const currentPosition = this.get("position");

      // اعمال مقیاس
      this.scale(scaleX, scaleY, opt);

      // به‌روزرسانی اندازه در مدل
      this.set("size", { width, height }, opt);

      return this;
    };

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
      const translate = paper.translate();
      const scale = paper.scale();

      const tx = translate.tx;
      const ty = translate.ty;
      const sx = scale.sx;
      const sy = scale.sy;

      const elementBBox = element.getBBox();
      const x = (elementBBox.x + tx) * sx;
      const y = (elementBBox.y + ty) * sy;
      const width = elementBBox.width * sx;
      const height = elementBBox.height * sy;

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

        // استفاده از متد scaleResize به جای resize معمولی
        // این باعث می‌شود که پورت‌ها نیز با المنت مقیاس‌بندی شوند
        if (element.get("scaleOnResize") !== false) {
          element.scaleResize(newWidth, newHeight);
        } else {
          // استفاده از روش معمولی برای المنت‌هایی که scaleOnResize ندارند
          element.resize(newWidth, newHeight);
        }
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
        const element = this.model;
        const newBBox = element.getBBox();
        const angle = element.get('angle') || 0; // دریافت زاویه چرخش المان

        // محاسبه نقطه مرکز المان
        const centerX = newBBox.x + newBBox.width / 2;
        const centerY = newBBox.y + newBBox.height / 2;

        // موقعیت اولیه نقاط قبل از چرخش
        const corners = [
          { x: newBBox.x, y: newBBox.y }, // top-left
          { x: newBBox.x + newBBox.width, y: newBBox.y }, // top-right
          { x: newBBox.x, y: newBBox.y + newBBox.height }, // bottom-left
          { x: newBBox.x + newBBox.width, y: newBBox.y + newBBox.height } // bottom-right
        ];

        // تابع کمکی برای چرخش یک نقطه حول مرکز
        const rotatePoint = (x, y, centerX, centerY, angle) => {
          const radians = (angle * Math.PI) / 180;
          const cos = Math.cos(radians);
          const sin = Math.sin(radians);

          const rotatedX = (x - centerX) * cos - (y - centerY) * sin + centerX;
          const rotatedY = (x - centerX) * sin + (y - centerY) * cos + centerY;

          return { x: rotatedX, y: rotatedY };
        };

        // چرخش هر نقطه
        const rotatedCorners = corners.map(corner =>
          rotatePoint(corner.x, corner.y, centerX, centerY, angle)
        );

        // به‌روزرسانی موقعیت دستگیره‌ها
        const handles = this.resizeHandles.querySelectorAll('rect');
        handles.forEach((handle, index) => {
          const pos = rotatedCorners[index];
          handle.setAttribute('x', pos.x - 5);
          handle.setAttribute('y', pos.y - 5);
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
            text: `Do you want to connect ${newElement.get("type") || newElement.attributes.type
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
