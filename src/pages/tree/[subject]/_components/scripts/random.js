import * as d3 from "d3"
const randomTree = () => {
	//id parent poids
	let tree = {}
	tree["0"] = {
		id: "0",
		parent: undefined,
		r: 0,
		w: 100,
		n: 1000,
		a: 60,
		t: "graine",
		ty: "r",
	}
	if (location.hostname === "localhost") {
		tree["1"] = {
			id: "1",
			parent: "0",
			r: 1,
			w: 100,
			n: 1000,
			a: 60,
			t: "graine",
			ty: "r",
		}
		tree["2"] = {
			id: "2",
			parent: "1",
			r: 2,
			w: 100,
			n: 1000,
			a: 60,
			t: "graine",
			ty: "r",
		}
		tree["3"] = {
			id: "3",
			parent: "0",
			r: 1,
			w: 100,
			n: 1000,
			a: 60,
			t: "graine",
			ty: "r",
		}
		tree["0"].children = [tree["1"], tree["3"]]
		tree["1"].children = [tree["2"]]
		tree["3"].co = tree["2"]
	} else {
		let id = "1"

		let makeKids = elem => {
			let kidsNumber = Math.floor(Math.random() * 3 + 1)
			let i
			elem.children = []
			for (i = 0; i < kidsNumber; i++) {
				let a = 30 + Math.random() * 70
				tree[id] = {
					id,
					r: elem.r + 1,
					a,
					n: Math.min(Math.random() * 1000, elem.n),
					w: Math.min(a, elem.a),
					t: "titre" + id,
					ty: "r",
				}
				elem.children.push(tree[id])
				id = parseInt(id)
				id++
				id = id.toString()
			}
		}
		// let makeXKids = elem => {
		// 	let kidsNumber = 2
		// 	let i
		// 	let life = 80
		// 	let block = 20
		// 	for (i = 0; i < kidsNumber; i++) {
		// 		tree.push({
		// 			id,
		// 			parent: elem.id,
		// 			r: elem.r + 1,
		// 			poids: 1000,
		// 			life,
		// 			block,
		// 		})
		// 		life = 30
		// 		block = 70
		// 		id++
		// 	}
		// }

		let makeBatch = r => {
			for (let key of Object.keys(tree)) {
				const elem = tree[key]
				if (elem.r === r) {
					makeKids(elem)
				}
			}
		}
		// let makeXBatch = r => {
		// 	tree.forEach(elem => {
		// 		if (elem.r === r) {
		// 			makeXKids(elem)
		// 		}
		// 	})
		// }

		makeBatch(0)
		makeBatch(1)
		makeBatch(2)
		makeBatch(3)
		makeBatch(4)
		makeBatch(5)
		//  makeBatch(6)
		//  makeBatch(7)
		//  makeBatch(8)
		// let root = d3
		// .stratify()
		// .id(d => d.id)
		// .parentId(d => d.parent)(tree)
		// console.log(root.children)
		//console.log(tree)
	}
	return tree
}
export default randomTree
