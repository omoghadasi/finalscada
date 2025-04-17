export default function ZoomController(paper, currentDocument) {
    let isPanning = false;
    let startPosition = { x: 0, y: 0 };

    // paper.scale(0.5); // زوم 1.5 برابر
    // paper.zoom(2, { max: 4, min: 0.5 }); // زوم 2 برابر با محدودیت‌های مشخص
    paper.on("blank:mousewheel", (evt, x, y, delta) => {
        const currentZoom = paper.scale().sx; // مقدار فعلی زوم
        const newZoom = Math.max(0.5, Math.min(2, currentZoom + delta * 0.1)); // محدودیت زوم
        paper.scale(newZoom, newZoom, { absolute: true });
    });

    paper.on("blank:pointerdown", (evt) => {
        if (!evt.ctrlKey) {
            isPanning = true;
            startPosition = { x: evt.clientX, y: evt.clientY };
            paper.el.style.cursor = "grab"; // تغییر نشانگر موس
        }
    });

    currentDocument.addEventListener("mousemove", (evt) => {
        if (!isPanning) return;

        const dx = evt.clientX - startPosition.x;
        const dy = evt.clientY - startPosition.y;

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);

        startPosition = { x: evt.clientX, y: evt.clientY };
    });

    currentDocument.addEventListener("mouseup", () => {
        if (isPanning) {
            isPanning = false;
            paper.el.style.cursor = "default"; // بازگرداندن نشانگر موس
        }
    });
}