import { dia } from "@joint/core";

export default class ToolbarManager {
  constructor(toolbarEl, jointEl, graph, namespace, elementUtils) {
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
    this.elementUtils = elementUtils;
  }

  init() {
    // Create toolbar panel
    this.toolbarPaper = new dia.Paper({
      el: this.toolbarEl,
      width: 200,
      height: 800,
      model: new dia.Graph(),
      interactive: false,
      background: { color: "#f0f0f0" },
    });

    this.createToolbarItems();

    // Setup element move listener
    this.setupElementMoveListener();
  }

  // Set up element move listener
  setupElementMoveListener() {
    // Variable to store the moving element
    let movingElement = null;

    // Add mouseup event to the document
    document.addEventListener("mouseup", () => {
      if (movingElement) {
        // Check for nearby elements after movement ends
        this.elementUtils.checkForNearbyElements(movingElement);
        movingElement = null;
      }
    });

    // Position change event to store the moving element
    this.graph.on("change:position", (element, position, opt) => {
      // Ignore position changes due to embedding
      if (opt.parentRelative) return;

      // Store the moving element
      movingElement = element;
    });
  }

  createToolbarItems() {
    // Add elements to the toolbar
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

      // Create a temporary element for drag display
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

      // Set initial position of the drag element
      const offsetX = event.clientX - element.getBoundingClientRect().left;
      const offsetY = event.clientY - element.getBoundingClientRect().top;

      // Function to update drag element position
      const moveElement = (e) => {
        dragElement.style.left = `${e.clientX - offsetX}px`;
        dragElement.style.top = `${e.clientY - offsetY}px`;
      };

      // Function to end drag
      const stopDrag = (e) => {
        document.removeEventListener("mousemove", moveElement);
        document.removeEventListener("mouseup", stopDrag);

        // Check if element is dropped on the main paper
        const paperRect = this.jointEl.getBoundingClientRect();
        if (
          e.clientX > paperRect.left &&
          e.clientX < paperRect.right &&
          e.clientY > paperRect.top &&
          e.clientY < paperRect.bottom
        ) {
          // Convert position to paper coordinates
          const x = e.clientX - paperRect.left;
          const y = e.clientY - paperRect.top;

          this.createNewElement(type, x, y);
        }

        // Remove drag element
        document.body.removeChild(dragElement);
      };

      document.addEventListener("mousemove", moveElement);
      document.addEventListener("mouseup", stopDrag);

      // Prevent default behavior
      event.preventDefault();
    });
  }

  createNewElement(type, x, y) {
    // Create new element in the graph
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
        // For pipes we need source and target, so we don't add anything yet
        alert(
          'To create a pipe, first select two elements and then choose "Connect" from the right-click menu.'
        );
        break;
      default:
        console.warn("Unknown element type:", type);
        break;
    }

    if (newElement) {
      newElement.addTo(this.graph);

      // Check proximity to other elements
      this.elementUtils.checkForNearbyElements(newElement);
    }
  }
}
