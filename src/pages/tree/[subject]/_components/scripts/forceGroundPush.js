/**
 * Pulls nodes toward a specified `(x, y)` target point.
 */
export default function () {
	let nodes, strength, strengths

	function force(alpha) {
		let node, target, strength
		for (let i = 0; i < nodes.length; i++) {
			node = nodes[i]
			strength = strengths[i]
			//console.log(1.2**(node.y/10))
			node.vy -= (100 / 2 ** (-(node.y+node.vy + 100) / 3000)) * alpha * strength
			if(node.vx>700)node.vx=700
			if(node.vx<-700)node.vx=-700
			if(node.vy>700)node.vy=700
			if(node.vy<-700)node.vy=-700
		}
	}

	function initialize() {
		if (!nodes) return

		// populate local `strengths` using `strength` accessor
		strengths = new Array(nodes.length)
		for (let i = 0; i < nodes.length; i++) strengths[i] = strength(nodes[i], i, nodes)
	}

	force.initialize = _ => {
		nodes = _
		initialize()
	}

	force.strength = _ => {
		// return existing value if no value passed
		if (_ == null) return strength

		// coerce `strength` accessor into a function
		strength = typeof _ === "function" ? _ : () => +_

		// reinitialize
		initialize()

		// allow chaining
		return force
	}

	if (!strength) force.strength(0.1)

	return force
}
