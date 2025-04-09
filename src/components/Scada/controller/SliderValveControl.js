export default dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["open"],
  children: util.svg/* xml */ `
         <foreignObject width="100" height="60">
             <div class="jj-slider" xmlns="http://www.w3.org/1999/xhtml">
                 <div @selector="label" class="jj-slider-label" style="">Valve 4</div>
                 <input @selector="slider" class="jj-slider-input" type="range" min="0" max="100" step="25" style="width:100%;"/>
                 <output @selector="value" class="jj-slider-output"></output>
             </div>
         </foreignObject>
     `,
  events: {
    "input input": "onInput",
  },
  highlight: function (cellView) {
    const { name = "" } = this.options;
    const { model } = cellView;
    const size = model.size();
    if (!this.childNodes) {
      // Render the slider only once to allow the user to drag it.
      this.renderChildren();
      this.childNodes.slider.value = model.get("open") * 100;
    }
    this.el.setAttribute(
      "transform",
      `translate(${size.width / 2 - 50}, ${size.height + 10})`
    );
    this.childNodes.label.textContent = name;
    this.childNodes.value.textContent = this.getSliderTextValue(
      model.get("open")
    );
  },
  getSliderTextValue: function (value = 0) {
    if (value === 0) {
      return "Closed";
    }
    if (value === 1) {
      return "Open";
    }
    return `${value * 100}% open`;
  },
  onInput: function (evt) {
    this.cellView.model.set("open", Number(evt.target.value) / 100);
  },
});
