import Swal from "sweetalert2";
import { dia, shapes } from "@joint/core";

export default class ElementUtils {
  constructor(graph) {
    this.graph = graph;
    this.initRotationTool();
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
