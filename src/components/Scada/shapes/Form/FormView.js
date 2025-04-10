import { dia } from "@joint/core";

export default dia.ElementView.extend({
  events: {
    "click button": "onSubmit",
  },

  onSubmit: function (evt) {
    evt.stopPropagation();
    const form = this.el.querySelector("foreignObject div");
    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;

    this.model.trigger("form:submit", { name, email });
  },
});
