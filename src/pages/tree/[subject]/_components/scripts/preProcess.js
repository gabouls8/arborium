import { counter } from "../../../../_components/scripts/parseSort"

const tooltip = node => {
	const title = "<p style='margin:0;'>" + node.data.t + "</p>"
	return title + '<span style="font-size:0.8rem; font-weight:500; font-style:italic; color:grey;">'+counter({node})+'</span>'
}

const preprocess = (minwidthHeight, root,arbre, parametres) => {
	const maxDepth = parametres.maxDepth
	const maxparticip = parametres.maxparticip
	const minparticip = parametres.minparticip
	const population = parametres.population
	const rayonStd = 20 * maxDepth ** 0.5 //(minwidthHeight ** 2 / 100 / population) ** 0.5
	const lengthStd = 8 * rayonStd
	const ratioMaxFB = 1.7
	const ecart = maxparticip - minparticip
	let index=0
	let links=[]
	root.each(node => {
		if (!node.parent) {
			node.alpha = -1.57
			node.x = 0
			node.y = 0
			node.rayonsecteur = minwidthHeight * maxDepth
		}
		if (node.children) {
			const numberkids = node.children.length
			let secteur = 3.14 / numberkids
			let debutsecteur = node.alpha - 1.57 + secteur / 2
			node.children.forEach(kid => {
				kid.alpha = debutsecteur
				kid.x = node.x + (Math.cos(kid.alpha) * node.rayonsecteur) / 2
				kid.y = node.y + (Math.sin(kid.alpha) * node.rayonsecteur) / 2
				kid.rayonsecteur = Math.min(node.rayonsecteur / 2, (Math.tan(secteur / 2) * node.rayonsecteur) / 2)
				debutsecteur += secteur
				links.push({source:node,target:kid,index})
				index++
			})
		}
		if(node.data.ty==='s'){
			node.data.an.forEach(a=>{
				const kid = node.children.find(c=>c.data.id===a.id).data
				if(node.data.qp!==0) kid.a=a.a?100*a.a/node.data.qp:0
				else kid.a=0
				kid.l=a.a?a.a:0
			})
		}
		if (node.data.ty === "a") node.rayon = node.parent.rayon
		else node.rayon = rayonStd * (node.data.a / 100)
		node.rayonLimited = node.parent
			? (node.parent.rayonLimited * node.data.a) / 100
			: node.data.a !== 0
			? (node.rayon / node.data.a) * 100
			: node.rayon
		node.rayonCollide = node.rayon * 1
		node.desiredLength = lengthStd * (node.data.a / 100)
		node.width =
			ecart !== 0 ? ratioMaxFB * node.rayon * (0.1 + (0.9 * (node.data.n - minparticip)) / ecart) : 0.4 * ratioMaxFB * node.rayon
		node.widthLimited = node.parent ? (node.parent.widthLimited * node.data.a) / 100 : 1.2 * node.rayonLimited
		node.tooltip = tooltip(node)
		if(node.data.co){
			links.push({source:node,target:arbre[node.data.co.id],index})	
			index++
		}
	})

	//const links = root.links()

	console.log(links)
	const nodes = root.descendants()
	nodes[0].fx = 0
	nodes[0].fy = 0

	return { links, nodes, rayonStd }
}

export default preprocess
