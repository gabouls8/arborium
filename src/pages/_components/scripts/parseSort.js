const parseSort = (value, order) => {
	if (value === "date") {
		if (!order) {
			return "Date"
		}
		if (order === "asc") {
			return "Plus anciens d'abord"
		}
		if (order === "desc") {
			return "Plus récents d'abord"
		}
	}
	if (value === "approbation") {
		if (!order) {
			return "Approbation"
		}
		if (order === "desc") {
			return "Plus approuvés d'abord"
		}
		if (order === "asc") {
			return "Moins approuvés d'abord"
		}
	}
	if (value === "unanimite") {
		if (!order) {
			return "Unanimité"
		}
		if (order === "desc") {
			return "Plus unanimes d'abord"
		}
		if (order === "asc") {
			return "Plus polémiques d'abord"
		}
	}
}

export const sortList = ["date", "approbation", "unanimite"]
export const defaultValues = { value: "date", order: "desc" }
export default parseSort

export const tabs = {
	sujets: ["sujets libres", "sondages"],
	sondage: ["libre", "qcm"],
	réponse: ["libre", "qcm"],
	remarque: ["libre", "qcm"],
}
export const header = {
	libre: "Exprimez vous..?",
	sondages: "Personne n'a déjà proposé votre question?",
}
export const intro = {
	libre: "Discussions, reflexions, critiques, idées, questions hors qcm, ou tout le reste...",
	qcm: "Posez des questions rapides à répondre, quitte à les enchaîner...",
	sondages: "Créez des suites de qcm dont le résultat est visible graphiquement...",
	reformulations: "Proposez une meilleure question...",
	"sujets libres": "Discussions libres pondérées graphiquement par les votes..",
}
export const code = {
	libre: "remarque",
	sondages: "sondage",
	qcm: "sondage",
	"sujets libres": "remarque",
}

export const parseType = ty => {
	if (ty === "s") return "sondage"
	if (ty === "a") return "réponse"
	if (ty === "r") return "remarque"
}

export const counter = ({ node, m, question }) => {
	let type, n, a, life
	if (m) {
		type = m.type
		n = m.participation
		a = m.approbation
		life = m.life
		if(type==="réponse"&&question) life =question.answers.find(r=>r.id===m.id).answered 
	}
	if (node) {
		type = parseType(node.data.ty)
		n = node.data.n
		a = node.data.a
		if (type === "réponse") {
			question = node.data.p
			question.questionsParticipation = question.qp
			life=question.an.find(a=>a.id===node.data.id).a
		}
	}
	if (type === "sondage") return `${Math.floor(a)}% des gens aiment cette question (${n} vote${n > 1 ? "s" : ""})`
	if (type === "réponse" && question)
		if (question.questionsParticipation)
		if(!life) return "personne n'a encore choisi cette réponse"
		else	return `${Math.floor((100 * life) / question.questionsParticipation)}% des gens ont choisi cette réponse (${life} personne${life > 1 ? "s" : ""})`
		else return "personne n'a encore répondu à la question"
	if (type === "réponse" && !question) return "Chargez le contenu de la question ci dessous pour voir les statistiques"
	else if (n === 0) return `Personne ne s'est exprimé sur ce message`
	else return `${Math.floor(a)}% des gens sur ${Math.floor(n)} personne${n > 1 ? "s" : ""} aiment ce message`
}
