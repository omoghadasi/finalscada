import { dia } from "@joint/core";
import Swal from "sweetalert2";

export default dia.ElementView.extend({
  events: {
    dblclick: "onDblClick",
  },

  initialize: function () {
    dia.ElementView.prototype.initialize.apply(this, arguments);

    // گوش دادن به تغییرات در مدل
    this.listenTo(this.model, "change:attrs", this.updateImageSize);
  },

  onRender: function () {
    dia.ElementView.prototype.onRender.apply(this, arguments);
    this.updateImageSize();
  },

  updateImageSize: function () {
    const imageElement = this.findBySelector("image")[0];
    if (imageElement) {
      // اطمینان از اینکه تصویر در محدوده کانتینر قرار می‌گیرد
      imageElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
  },

  onDblClick: function (evt) {
    evt.stopPropagation();
    this.showImageUploadDialog();
  },

  showImageUploadDialog: function () {
    // نمایش مقادیر فعلی در دیالوگ
    const currentLabel = this.model.attr("label/text") || "";

    Swal.fire({
      title: "تنظیمات تصویر",
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="image-url" style="display: block; margin-bottom: 5px; font-weight: bold;">آدرس تصویر:</label>
          <input id="image-url" class="swal2-input" placeholder="آدرس URL تصویر را وارد کنید" style="width: 100%;">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="image-upload" style="display: block; margin-bottom: 5px; font-weight: bold;">یا تصویر را آپلود کنید:</label>
          <input type="file" id="image-upload" accept="image/*" class="swal2-file" style="width: 100%;">
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="image-label" style="display: block; margin-bottom: 5px; font-weight: bold;">عنوان تصویر:</label>
          <input id="image-label" class="swal2-input" value="${currentLabel}" placeholder="عنوان تصویر را وارد کنید" style="width: 100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "تایید",
      cancelButtonText: "انصراف",
      didOpen: () => {
        // تنظیم اندازه اولیه المنت
        const size = this.model.get("size");
        if (!size || size.width < 150 || size.height < 150) {
          this.model.resize(150, 150);
        }
      },
      preConfirm: () => {
        const urlInput = document.getElementById("image-url");
        const fileInput = document.getElementById("image-upload");
        const labelInput = document.getElementById("image-label");

        // اگر هم URL و هم فایل خالی باشند، خطا نمایش بده
        if (
          !urlInput.value &&
          (!fileInput.files || fileInput.files.length === 0)
        ) {
          Swal.showValidationMessage(
            "لطفاً یک تصویر انتخاب کنید یا آدرس URL را وارد کنید"
          );
          return false;
        }

        return {
          url: urlInput.value,
          file:
            fileInput.files && fileInput.files.length > 0
              ? fileInput.files[0]
              : null,
          label: labelInput.value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { url, file, label } = result.value;

        // تنظیم عنوان
        if (label) {
          this.model.setLabel(label);
        }

        // اگر فایل آپلود شده باشد، آن را پردازش کن
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.model.setImageUrl(e.target.result);
            this.updateImageSize();
          };
          reader.readAsDataURL(file);
        }
        // در غیر این صورت از URL استفاده کن
        else if (url) {
          this.model.setImageUrl(url);
          this.updateImageSize();
        }
      }
    });
  },
});
