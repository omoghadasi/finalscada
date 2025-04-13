import { dia } from "@joint/core";
import Swal from "sweetalert2";

export default dia.ElementView.extend({
  events: {
    dblclick: "onDblClick",
  },

  onRender: function () {
    dia.ElementView.prototype.onRender.apply(this, arguments);

    // به‌روزرسانی تصویر
    this.updateImage();
  },

  updateImage: function () {
    // دریافت URL تصویر
    const imageUrl = this.model.get("imageUrl");
    if (!imageUrl) return;

    // به‌روزرسانی src تصویر - ساده و مستقیم
    const imgElement = this.el.querySelector("img");
    if (imgElement) {
      imgElement.src = imageUrl;
    }
  },

  onDblClick: function (evt) {
    evt.stopPropagation();
    this.showImageUploadDialog();
  },

  showImageUploadDialog: function () {
    // دریافت عنوان فعلی
    const currentLabel = this.model.attr("label/text") || "";
    const currentUrl = this.model.get("imageUrl") || "";

    Swal.fire({
      title: "تنظیمات تصویر",
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label for="image-url" style="display: block; margin-bottom: 5px; font-weight: bold;">آدرس تصویر:</label>
          <input id="image-url" class="swal2-input" value="${currentUrl}" placeholder="آدرس URL تصویر را وارد کنید" style="width: 100%;">
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
      preConfirm: () => {
        const urlInput = document.getElementById("image-url");
        const fileInput = document.getElementById("image-upload");
        const labelInput = document.getElementById("image-label");

        // اعتبارسنجی ورودی‌ها
        if (
          !urlInput.value &&
          (!fileInput.files || fileInput.files.length === 0) &&
          !currentUrl // اگر URL قبلی وجود ندارد
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

        // پردازش آپلود فایل
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.model.prop("imageUrl", e.target.result);
            this.updateImage();
          };
          reader.readAsDataURL(file);
        }
        // یا استفاده از URL
        else if (url) {
          this.model.prop("imageUrl", url);
          this.updateImage();
        }
      }
    });
  },
});
