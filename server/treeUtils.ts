const zipTree: any = (unzipped: any) => {
	//console.log(unzipped)
	const $keys: any = {}
	const keys: any = Object.keys(unzipped)
	keys.forEach((k: any, i: number) => {
		$keys[k] = i.toString()
	})
	keys.forEach((k: any) => {
		if (unzipped[k].p) unzipped[k].p = $keys[unzipped[k].p.id]
		if(unzipped[k].co) unzipped[k].co = $keys[unzipped[k].co.id]
		if (unzipped[k].c) {
			unzipped[k].c.forEach((c: any, i: number) => {
				unzipped[k].c[i] = $keys[c.id]
			})
		}
	})
	keys.forEach((k: any) => delete unzipped[k].id)
}

const unzipTree: any = (zipped: any) => {
	const keys = Object.keys(zipped)
	// console.log("zipped")
	// console.log(zipped)
	keys.forEach((k: string) => {
		zipped[k].id = k
	})
	keys.forEach((k: string) => {
		//console.log(keys)
		if (zipped[k].p) {
			//  console.log('parent avant/apres')
			//  console.log(zipped[k].p)
			zipped[k].p = zipped[keys[parseInt(zipped[k].p)]]
			//  console.log(zipped[k].p)
		}
		if (zipped[k].co) {
			//  console.log('parent avant/apres')
			//  console.log(zipped[k].p)
			zipped[k].co = zipped[keys[parseInt(zipped[k].co)]]
			//  console.log(zipped[k].p)
		}
		if (zipped[k].c) {
			// console.log("children avant/apres")
			// console.log(zipped[k].c)
			zipped[k].c.forEach((c: any, i: number) => {
				zipped[k].c[i] = zipped[keys[parseInt(c)]]
			})
		}
	})
}

const createOrUpdateTree: any = async (formatedMessages: any, db: any, subject: string, tree: any) => {
	try {
		let seed: string = ""
		for (const m of Object.keys(formatedMessages)) {
			//on pourrait peut etre reprendre la seed trouvée dans index.ts... non ca sert que quand le sujet est neuf
			// console.log("messages formatés")
			// console.log(formatedMessages[m])
			if (formatedMessages[m].r === 0) {
				seed = formatedMessages[m].id
				//console.log(seed)
				break
			}
		}
		//const data = await db.collection("tree").doc(subject).get()
		// console.log("data")
		// console.log(data.data())
		if (!tree && seed) {
			//d'abord essayer de trouver l'arbre, pour voir si c'est une modif
			// console.log("création d'un nouvel arbre")
			const newtree: any = makeTree(seed, formatedMessages)
			makeHierarchy(newtree)
			initCalc(newtree[seed])
			zipTree(newtree)
			const newtreelight = cloneTrim(newtree)
			// console.log('------------------------------tree :')
			// console.log(tree)
			// console.log('------------------------------end of tree :')
			// console.log("attempting write tree on subject n° :")
			// console.log(subject)
			const promise = [
				db
					.collection("tree")
					.doc(subject)
					.set({ tree: JSON.stringify(newtree) }),
				db
					.collection("treelight")
					.doc(subject)
					.set({ treelight: JSON.stringify(newtreelight) }),
			]
			await Promise.all(promise)
			// console.log("both trees successfully writen")
			return null
		} else if (!tree && !seed) {
			// console.log("Pas d'arbre et pas de seed: c'est normalement incompatible...!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
			return null
		} else {
			// console.log("no seed ou actualisation des votes de la seed")

			const oldtree: any = JSON.parse(tree.tree)
			//console.log(tree)
			unzipTree(oldtree)
			//console.log("unzip")
			//console.log(oldtree)
			attach(formatedMessages, oldtree)
			//console.log(oldtree)
			// on doit rajouter les calculs
			seed = findSeed(oldtree)
			initCalc(oldtree[seed])
			// console.log("attach")
			// console.log(Object.keys(tree).length)
			// console.log("------------------------------tree :")
			// console.log(tree)
			// console.log("------------------------------end of tree :")

			//...
			zipTree(oldtree)
			const treelight = cloneTrim(oldtree)
			//console.log(oldtree)
			// console.log(treelight)
			// console.log("------------------------------treelight :")
			// console.log(treelight)
			// console.log("------------------------------end of treelight :")
			// console.log("zip")
			// console.log("------------------------------tree :")
			// console.log(tree)
			// console.log("------------------------------end of tree :")
			// console.log("attempting write tree on subject n° :")
			// console.log(subject)
			const promise = [
				db
					.collection("tree")
					.doc(subject)
					.set({ tree: JSON.stringify(oldtree) }),
				db
					.collection("treelight")
					.doc(subject)
					.set({ treelight: JSON.stringify(treelight) }),
			]
			await Promise.all(promise)
			// console.log("both trees successfully writen")
			return null
		}
	} catch (error) {
		// console.log(error)
		throw new Error(error)
	}
}
const cloneTrim: any = (zippedTree: any) => {
	//console.log(zippedTree)
	const keys = Object.keys(zippedTree) //[id1,id2...]
	const nkeys: any = [] //[id2,id5,id6,id8]
	const trimmedZipped: any = {}
	keys.forEach((k: any) => {
		const node = zippedTree[k]
		const parent = zippedTree[keys[parseInt(zippedTree[k].p)]]
		if (node.r === 0 || parent.br >= 40) {
			trimmedZipped[k] = { ...node }
			delete trimmedZipped[k].p
			nkeys.push(k)
		}
	})
	// console.log(keys)
	// console.log(nkeys)
	const tab: any = {}
	nkeys.forEach((nk: any, nki: number) => (tab[keys.findIndex((a: any) => a === nk).toString()] = nki.toString()))
	// console.log(tab)
	for (const kk of Object.keys(trimmedZipped)) {
		if (trimmedZipped[kk].c) {
			trimmedZipped[kk].c = [...trimmedZipped[kk].c]
			trimmedZipped[kk].c.forEach((kidkey: any, i: number) => {
				trimmedZipped[kk].c[i] = tab[kidkey]
			})
		}
	}
	return trimmedZipped
}
const findSeed: any = (tree: any) => {
	for (const m of Object.keys(tree)) {
		if (tree[m].r === 0) return m
	}
	throw new Error("did not find any seed for this tree")
}
const makeTree: any = (seed: any, formatedMessages: any) => {
	delete formatedMessages[seed].p
	const tree: any = formatedMessages
	return tree
}
const makeHierarchy: any = (tree: any) => {
	for (const n of Object.keys(tree)) {
		const kid = tree[n]
		if (kid.p) {
			const parent = tree[kid.p]
			if (parent.c) parent.c.push(kid)
			else parent.c = [kid]
			kid.p = parent
		}
		if(kid.co) kid.co=tree[kid.co]
	}
}
const attach: any = (formatedMessages: any, tree: any) => {
	//on doit traiter le cas où les messages existent déja
	//console.log(formatedMessages)
	for (const m of Object.keys(formatedMessages)) {
		const message: any = formatedMessages[m]
		if (tree[m]) {
			tree[m].l = message.l
			tree[m].b = message.b
			tree[m].n = message.n
			tree[m].a = message.a
			tree[m].u = message.u
			if(message.an)tree[m].an = message.an
			if(message.qp)tree[m].qp = message.qp
		} else tree[m] = message
	}
	for (const m of Object.keys(formatedMessages)) {
		const message: any = formatedMessages[m]
		if (message.p && typeof message.p === "string") {
			const parent = tree[message.p]
			// console.log("parent")
			// console.log(parent)
			if (parent.c) {
				//console.log(!!parent.c.find((c: any) => c.id === message.id))
				if (!parent.c.find((c: any) => c.id === message.id)) parent.c.push(message)
			} else parent.c = [message]
			message.p = parent
		}
		if(message.co&&typeof message.co === "string"){
			message.co = tree[message.co]
		}
	}
	//console.log(tree)
}

const each: any = function (root: any, callback: any) {
	let node = root,
		current,
		next = [node],
		children: any
	do {
		current = next.reverse()
		next = []
		while (current.length > 0) {
			node = current.pop()
			callback(node)
			children = node.c
			if (children)
				for (const kid of children) {
					next.push(kid)
				}
		}
	} while (next.length)
	return root
}
// const eachBefore: any = (root: any, callback: any) => {
// 	var node = root,
// 		nodes = [node],
// 		children,
// 		i
// 	while ((node = nodes.pop())) {
// 		callback(node), (children = node.children)
// 		if (children)
// 			for (i = children.length - 1; i >= 0; --i) {
// 				nodes.push(children[i])
// 			}
// 	}
// 	return root
// }

// const makeTreeLight:any = (tree:any)=>{
// 	const treeLight = {}
// 	for()
// }
const initCalc: any = (root: any) => {
	//on va calculer un poids (w) et une valeur de branche
	each(root, calc)
}

const calc: any = (node: any) => {
	node.w = weight(node)
	node.br = br(node)
}

const weight: any = (node: any) => {
	return node.a
}
const br: any = (node: any) => {
	if (node.r === 0) return node.w
	else return Math.min(node.p.w, node.w)
}
// const filterElem: any = (elem: any) => {
// 	return {
// 		l: elem.data().life,
// 		b: elem.data().block,
// 		n: elem.data().participation,
// 		a: elem.data().approbation,
// 		u: elem.data().unanimite,
// 		t: elem.data().title,
// 		p: elem.data().parent,
// 		r: elem.data().rank,
// 		s: elem.data().subject,
// 		id: elem.id,
// 		//c: children
// 		//w:weight
// 		//br:branch
// 	}
// }
const extract: any = (array: any, validate: any) => {
	const indexes: any = []
	const filtered: any = array.filter((a: any, i: number) => {
		if (validate(a)) {
			indexes.push(i)
			return true
		} else return false
	})
	let j = indexes.length - 1
	for (j; j >= 0; j--) {
		array.splice(indexes[j], 1)
	}
	return filtered
}

exports.zipTree = zipTree
exports.unzipTree = unzipTree
exports.initCalc = initCalc
exports.makeTree = makeTree
exports.makeHierarchy = makeHierarchy
//exports.filterElem = filterElem
exports.extract = extract
exports.createOrUpdateTree = createOrUpdateTree
