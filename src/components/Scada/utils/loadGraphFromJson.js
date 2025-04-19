import { dia } from "@joint/core";

/**
 * Load a JointJS graph from a JSON object,
 * ensuring elements are added before links to avoid errors.
 *
 * @param {dia.Graph} graph - The JointJS graph instance.
 * @param {Object} json - The JSON object from graph.toJSON().
 */
export default function loadGraphFromJSON(graph, json) {
    if (!json || !json.cells || !Array.isArray(json.cells)) {
        console.error("Invalid graph data format.");
        return;
    }

    const cells = json.cells;

    const links = [];
    const elements = [];

    cells.forEach((cell) => {
        // اگر نوع cell یکی از این لینک‌ها بود بذار توی لینک‌ها
        if (
            cell.type === "link" ||
            cell.type === "standard.Link" ||
            cell.type === "Pipe"
        ) {
            links.push(cell);
        } else {
            elements.push(cell);
        }
    });
    graph.clear();
    graph.addCells(elements);
    graph.addCells(links);
}
