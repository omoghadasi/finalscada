import { dia, util } from "@joint/core";
export default dia.HighlighterView.extend({
  UPDATE_ATTRIBUTES: ["power"],
  tagName: "g",
  children: util.svg/* xml */ `
         <foreignObject width="20" height="20">
             <div class="jj-checkbox" xmlns="http://www.w3.org/1999/xhtml">
                 <input @selector="input" class="jj-checkbox-input" type="checkbox" style="width: 14px; height: 14px; box-sizing: border-box; margin: 2px;"/>
             </div>
         </foreignObject>
     `,
  events: {
    "change input": "onChange",
  },
  attributes: {
    transform: "translate(5, 5)",
  },
  highlight: function (cellView) {
    this.renderChildren();
    this.childNodes.input.checked = Boolean(cellView.model.power);
  },
  onChange: function (evt) {
    this.cellView.model.power = evt.target.checked ? 1 : 0;
  },
});
