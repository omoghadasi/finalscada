import { dia } from "@joint/core";

export default dia.ElementView.extend({
  events: {
    click: "onClick",
  },
  onClick: function (evt) {
    evt.stopPropagation();
    this.model.trigger("button:click");
  },
});
