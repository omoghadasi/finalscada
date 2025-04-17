import { util } from '@joint/core'
import { toast } from 'vue3-toastify';
export default function MultiSelectController(paper, graph) {
    let selectedElements = [];
    let isSelecting = false;
    let selectionStart = { x: 0, y: 0 };
    let selectionBox = null;

    // رویداد برای شروع انتخاب
    paper.on('blank:pointerdown', (evt, x, y) => {
        if (!evt.ctrlKey) {
            // پاک کردن انتخاب‌های قبلی اگر Ctrl نگه داشته نشده باشد
            selectedElements.forEach((element) => {
                element.findView(paper).unhighlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
            });
            selectedElements = [];
        } else {
            // شروع انتخاب
            isSelecting = true;
            selectionStart = { x, y };

            // ایجاد یک مستطیل برای نمایش ناحیه انتخاب
            selectionBox = paper.svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "rect"));
            selectionBox.setAttribute("x", x);
            selectionBox.setAttribute("y", y);
            selectionBox.setAttribute("width", 0);
            selectionBox.setAttribute("height", 0);
            selectionBox.setAttribute("fill", "rgba(52, 152, 219, 0.3)");
            selectionBox.setAttribute("stroke", "#3498db");
            selectionBox.setAttribute("stroke-width", 1);
        }
    });

    paper.on('blank:pointermove', (evt, x, y) => {
        if (!isSelecting || !selectionBox) return;

        // به‌روزرسانی اندازه مستطیل انتخاب
        const width = Math.abs(x - selectionStart.x);
        const height = Math.abs(y - selectionStart.y);
        const rectX = Math.min(x, selectionStart.x);
        const rectY = Math.min(y, selectionStart.y);

        selectionBox.setAttribute("x", rectX);
        selectionBox.setAttribute("y", rectY);
        selectionBox.setAttribute("width", width);
        selectionBox.setAttribute("height", height);
    });

    paper.on('blank:pointerup', (evt, x, y) => {
        if (!isSelecting || !selectionBox) return;

        // پایان انتخاب
        isSelecting = false;

        // محاسبه ناحیه انتخاب
        const selectionRect = {
            x: parseFloat(selectionBox.getAttribute("x")),
            y: parseFloat(selectionBox.getAttribute("y")),
            width: parseFloat(selectionBox.getAttribute("width")),
            height: parseFloat(selectionBox.getAttribute("height")),
        };

        // انتخاب المان‌هایی که در ناحیه انتخاب قرار دارند
        graph.getElements().forEach((element) => {
            const bbox = element.getBBox();
            if (
                bbox.x >= selectionRect.x &&
                bbox.y >= selectionRect.y &&
                bbox.x + bbox.width <= selectionRect.x + selectionRect.width &&
                bbox.y + bbox.height <= selectionRect.y + selectionRect.height
            ) {
                if (!selectedElements.includes(element)) {
                    selectedElements.push(element);
                    element.findView(paper).highlight(null, {
                        highlighter: {
                            name: 'stroke',
                            options: {
                                attrs: {
                                    stroke: '#3498db',
                                    'stroke-width': 3,
                                },
                            },
                        },
                    });
                }
            }
        });

        // حذف مستطیل انتخاب
        selectionBox.remove();
        selectionBox = null;
    });

    paper.on('element:pointerdown', (elementView, evt) => {
        const element = elementView.model;

        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                // اگر المان قبلاً انتخاب شده باشد، آن را از لیست حذف کن
                elementView.unhighlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
                selectedElements = selectedElements.filter((el) => el !== element);
            } else {
                // اگر المان انتخاب نشده باشد، آن را به لیست اضافه کن
                elementView.highlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
                selectedElements.push(element);
            }
        } else {
            // اگر Ctrl نگه داشته نشده باشد، فقط این المان را انتخاب کن
            selectedElements.forEach((el) => {
                el.findView(paper).unhighlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
            });
            selectedElements = [];
        }
    });

    // اضافه کردن رویداد Ctrl + A
    document.addEventListener('keydown', async (evt) => {
        if (evt.ctrlKey && evt.key === 'a') {
            evt.preventDefault(); // جلوگیری از رفتار پیش‌فرض مرورگر

            // انتخاب همه المان‌ها
            selectedElements.forEach((element) => {
                element.findView(paper).unhighlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
            });
            selectedElements = [];

            graph.getElements().forEach((element) => {
                selectedElements.push(element);
                element.findView(paper).highlight(null, {
                    highlighter: {
                        name: 'stroke',
                        options: {
                            attrs: {
                                stroke: '#3498db',
                                'stroke-width': 3,
                            },
                        },
                    },
                });
            });
        }

        if (evt.ctrlKey && evt.key === 'c') {
            if (selectedElements) {
                evt.preventDefault();
                const copiedElements = selectedElements.map((element) => {
                    return { ...element.toJSON() }; // فرض بر این است که toJSON() یک شیء قابل کپی برمی‌گرداند
                });
                // add json to clipboard
                navigator.clipboard.writeText(JSON.stringify(copiedElements)).then(() => {
                    toast("Copied to clipboard!", {
                        "type": "success",
                    })
                }).catch((err) => {
                    toast("Error copying to clipboard: " + err, {
                        "type": "error",
                    })
                });
            }
        }

        if (evt.ctrlKey && evt.key === "x") {
            // cut to clipboard
            if (selectedElements) {
                evt.preventDefault();
                const cutElements = selectedElements.map((element) => {
                    return { ...element.toJSON() }; // فرض بر این است که toJSON() یک شیء قابل کپی برمی‌گرداند
                });
                // add json to clipboard
                navigator.clipboard.writeText(JSON.stringify(cutElements)).then(() => {
                    toast("Copied to clipboard!", {
                        "type": "success",
                    })
                }).catch((err) => {
                    toast("Error copying to clipboard: " + err, {
                        "type": "error",
                    })
                });

                selectedElements.forEach((element) => {
                    if (element.findView(paper).rotateHandle) {
                        element.findView(paper).rotateHandle.remove();
                        document.removeEventListener(
                            "mousedown",
                            element.findView(paper)._removeRotateHandleListener
                        );
                    }
                    if (element.findView(paper).resizeHandles) {
                        element.findView(paper).resizeHandles.remove();
                        document.removeEventListener(
                            "mousedown",
                            element.findView(paper)._removeResizeHandlesListener
                        );
                    }

                })
                // remove elements from graph
                graph.removeCells(selectedElements);
                selectedElements = []
            }
        }

        if (evt.ctrlKey && evt.key === "v") {
            evt.preventDefault();
            navigator.clipboard.readText().then((text) => {
                const pastedElements = JSON.parse(text);
                pastedElements.forEach((element) => {
                    element.id = util.uuid()
                    element.position = {
                        x: element.position.x + 20,
                        y: element.position.y + 20,
                    }
                });
                graph.addCells(pastedElements)
            }).catch((err) => {
                toast("Unable to Access Pasting: " + err, {
                    "type": "error",
                })
            });

        }
    });

    return {
        getSelectedElements: () => selectedElements,
        clearSelection: () => {
            selectedElements.forEach((element) => {
                element.findView(paper).unhighlight();
            });
            selectedElements = [];
        },
    };
}