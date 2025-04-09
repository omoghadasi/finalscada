export default dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["open"],
  children: util.svg/* xml */ `
         <foreignObject width="100" height="50">
             <div class="jj-switch" xmlns="http://www.w3.org/1999/xhtml">
                 <div @selector="label" class="jj-switch-label" style=""></div>
                 <button @selector="buttonOn" class="jj-switch-on">open</button>
                 <button @selector="buttonOff" class="jj-switch-off">close</button>
             </div>
         </foreignObject>
     `,
  events: {
    "click button": "onButtonClick",
  },
  highlight: function (cellView) {
    this.renderChildren();
    const { model } = cellView;
    const { el, childNodes } = this;
    const size = model.size();
    const isOpen = model.get("open");
    el.setAttribute(
      "transform",
      `translate(${size.width / 2 - 50}, ${size.height + 10})`
    );
    childNodes.buttonOn.disabled = !isOpen;
    childNodes.buttonOff.disabled = isOpen;
    childNodes.label.textContent = model.attr("label/text");
  },
  onButtonClick: function (evt) {
    const { model } = this.cellView;
    const isOpen = model.get("open");
    model.set("open", !isOpen);
  },
});
