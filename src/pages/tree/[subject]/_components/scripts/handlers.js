import { select, selectAll, event, mouse } from "d3"

export const selectionne = (d, i, n) => {
	selectAll("circle").style("stroke", "none")
	select(n[i]).style("stroke", "rgb(0, 26, 255)").style("stroke-width", 5)
}
export const dragstarted = simulation => {
	return d => {
		if (d.depth > 0) {
			if (!event.active) simulation.alphaTarget(0.1).restart()
			d.x = d.x
			d.y = d.y
		}
	}
}
export const dragged = (simulation, dragging, tooltip) => {
	return d => {
		if (d.depth > 0) {
			tooltip.style("visibility", "hidden")
			dragging.drag = true
			d.fx = event.x
			d.fy = event.y
		}
	}
}
export const dragended = (simulation, dragging) => {
	return d => {
		if (d.depth > 0) {
			dragging.drag = false
			if (!event.active) simulation.alphaTarget(0.2)
			delete d.fx
			delete d.fy
		}
	}
}
