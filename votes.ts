const treeUtils = require("./treeUtils")

const getSortAndDeleteObsoletes: any = async (votesTempCopy: any, db: any) => {
	try {
		const users: any = []
		const toBeDeleted: any = []
		let answers: any = {}
		let votes: any = {}
		votesTempCopy.forEach((vote: any, ind: number) => {
			if (vote.user !== users[users.length - 1]) {
				users.push(vote.user)
				answers = {}
				votes = {}
			}
			if (["block", "life", "none"].includes(vote.vote)) {
				if (!votes[vote.message]) votes[vote.message] = true
				else toBeDeleted.push({ id: vote.id, ind, user: vote.user })
			} else {
				if (!answers[vote.message]) answers[vote.message] = true
				else toBeDeleted.push({ id: vote.id, ind, user: vote.user })
			}
		})
		// console.log(`got ${users.length} users`)
		// console.log('votes temp copy initial')
		// console.log(votesTempCopy.map((v:any)=>v.id))
		//  console.log(`got ${toBeDeleted.length} obsolete votes`)
		//  console.log(toBeDeleted.map((tbd:any)=>tbd.id))

		//on lance la suppression des votes temp obsoletes
		const promisesDelete: any = []
		toBeDeleted.forEach((d: any) => {
			const path = `users/${d.user}/votesTemp/${d.id}`
			promisesDelete.push(db.doc(path).delete())
		})
		await Promise.all(promisesDelete)
		for (let i = toBeDeleted.length - 1; i >= 0; i--) {
			votesTempCopy.splice(toBeDeleted[i].ind, 1)
		}
		return { users, votesTempCopy }
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getAndUpdateUsersAndDeleteLastVotesTemp: any = async (users: any, votesTempCopy: any, db: any) => {
	try {
		//on va chercher user.votes
		const userPromises: any = []
		users.forEach((u: any) => {
			userPromises.push(db.doc(`users/${u}`).get())
		})
		const userDocs: any = await Promise.all(userPromises)
		// console.log(`got ${userDocs.length} users remaining`)
		const currentVotes: any = {}
		const currentAnswers: any = {}
		userDocs.forEach((ud: any) => {
			currentVotes[ud.id] = { votes: ud.data().votes }
			currentAnswers[ud.id] = { answers: ud.data().answers }
		})

		const promisesDeleteVotesTempAndUpdatUsers: any = []
		votesTempCopy.forEach((v: any) => {
			if (["block", "life", "none"].includes(v.vote)) {
				if (!currentVotes[v.user].votes || !currentVotes[v.user].votes[v.message]) {
					v[v.vote] = 1
					votesTempCopy.updates = true
				} else if (
					currentVotes[v.user].votes[v.message].vote !== v.vote &&
					(currentVotes[v.user].votes[v.message].date._seconds < v.date._seconds ||
						(currentVotes[v.user].votes[v.message].date._seconds === v.date._seconds &&
							currentVotes[v.user].votes[v.message].date._nanoseconds < v.date._nanoseconds))
				) {
					v[v.vote] = 1
					v[currentVotes[v.user].votes[v.message].vote] = -1
					votesTempCopy.updates = true
				}
				if (!currentVotes[v.user]) {
					currentVotes[v.user] = { votes: {} }
				}
				if (!currentVotes[v.user].votes) {
					currentVotes[v.user].votes = { [v.message]: { vote: v.vote, date: v.date } }
				} else {
					currentVotes[v.user].votes[v.message] = { vote: v.vote, date: v.date }
				}
			} else {
				v.answers = {}
				if (!currentAnswers[v.user].answers || !currentAnswers[v.user].answers[v.message]) {
					v.answers[v.vote] = 1
					votesTempCopy.updates = true
				}
				else if (
					currentAnswers[v.user].answers[v.message].vote !== v.vote &&
					(currentAnswers[v.user].answers[v.message].date._seconds < v.date._seconds ||
						(currentAnswers[v.user].answers[v.message].date._seconds === v.date._seconds &&
							currentAnswers[v.user].answers[v.message].date._nanoseconds < v.date._nanoseconds))
				) {
					v.answers[v.vote] = 1
					v.answers[currentAnswers[v.user].answers[v.message].vote] = -1
					votesTempCopy.updates = true
				}
				if (!currentAnswers[v.user]) {
					currentAnswers[v.user] = { answers: {} }
				}
				if (!currentAnswers[v.user].answers) {
					currentAnswers[v.user].answers = { [v.message]: { vote: v.vote, date: v.date } }
					v.new = true
				} else {
					if(!currentAnswers[v.user].answers[v.message]) v.new=true
					currentAnswers[v.user].answers[v.message] = { vote: v.vote, date: v.date }
				}
			}

			promisesDeleteVotesTempAndUpdatUsers.push(db.doc(`users/${v.user}/votesTemp/${v.id}`).delete())
		})
		users.forEach((user: any) => {
			promisesDeleteVotesTempAndUpdatUsers.push(
				db.doc(`users/${user}`).set({ votes: currentVotes[user].votes, answers: currentAnswers[user].answers }, { merge: true })
			)
		})
		await Promise.all(promisesDeleteVotesTempAndUpdatUsers)
		return votesTempCopy
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const getMessagesAndTitles: any = async (votesTempCopy: any, db: any) => {
	try {
		const messagesUpdates: any = {}
		votesTempCopy.forEach((v: any) => {
			if (!messagesUpdates[v.message]) messagesUpdates[v.message] = { life: 0, block: 0 }
			messagesUpdates[v.message].life += v.life ? v.life : 0
			messagesUpdates[v.message].block += v.block ? v.block : 0

			if (v.new && !messagesUpdates[v.message].questionsParticipation) messagesUpdates[v.message].questionsParticipation = 1
			else if (v.new) messagesUpdates[v.message].questionsParticipation += 1

			if (v.answers && !messagesUpdates[v.message].answers)
				messagesUpdates[v.message].answers = Object.keys(v.answers).map((a: any) => ({ id: a, answered: v.answers[a] }))
			else if (v.answers) {
				if (messagesUpdates[v.message].answers.find((a: any) => a.id === v.vote))
					messagesUpdates[v.message].answers.forEach((a: any) => {
						if (!a.answered) a.answered = 0
						if (v[a.id]) a.answered += v[a.id]
					})
			}
		})
		const messages = Object.keys(messagesUpdates)
		const promisesMessages: any = []
		messages.forEach(async (m: any) => {
			let life: number
			let block: number
			promisesMessages.push(
				db
					.collection("messages")
					.doc(m)
					.get()
					.then(async (data: any) => {
						try {
							const messageDoc: any = data.data()

							life = messageDoc.life ? messageDoc.life : 0
							block = messageDoc.block ? messageDoc.block : 0
							messagesUpdates[m].life = messagesUpdates[m].life ? life + messagesUpdates[m].life : life
							messagesUpdates[m].block = messagesUpdates[m].block ? block + messagesUpdates[m].block : block
							messagesUpdates[m].participation = messagesUpdates[m].life + messagesUpdates[m].block
							messagesUpdates[m].approbation =
								messagesUpdates[m].participation !== 0
									? (100 * messagesUpdates[m].life) / messagesUpdates[m].participation
									: 0
							messagesUpdates[m].unanimite = Math.abs(messagesUpdates[m].approbation - 50) * 2
							messagesUpdates[m].title = messageDoc.title
							messagesUpdates[m].parent = messageDoc.parent
							if(messageDoc.connect)messagesUpdates[m].connect=messageDoc.connect
							messagesUpdates[m].rank = messageDoc.rank
							messagesUpdates[m].id = data.id
							messagesUpdates[m].type = messageDoc.type
							messagesUpdates[m].answers = messageDoc.answers
								? messagesUpdates[m].answers
									? messageDoc.answers.map((a: any) => {
											const answer = messagesUpdates[m].answers.find((an: any) => a.id === an.id)
											if (answer) {
												if (a.answered) a.answered += answer.answered
												else a.answered = answer.answered
											} 
											return a
									  })
									: messageDoc.answers
								: undefined
							messagesUpdates[m].questionsParticipation =
								messagesUpdates[m].questionsParticipation || messageDoc.questionsParticipation
									? messagesUpdates[m].questionsParticipation
										? messageDoc.questionsParticipation
											? messageDoc.questionsParticipation + messagesUpdates[m].questionsParticipation
											: messagesUpdates[m].questionsParticipation
										: messageDoc.questionsParticipation
									: undefined
						} catch (e) {
							console.log(e)
						}
					})
			)
		})
		await Promise.all(promisesMessages)
		return messagesUpdates
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const updateMessages: any = async (messagesUpdates: any, db: any) => {
	try {
		const promiseUpdates: any = []
		for (const m of Object.keys(messagesUpdates)) {
			promiseUpdates.push(
				db.collection("messages").doc(m).set(
					{
						life: messagesUpdates[m].life,
						block: messagesUpdates[m].block,
						participation: messagesUpdates[m].participation,
						unanimite: messagesUpdates[m].unanimite,
						approbation: messagesUpdates[m].approbation,
						questionsParticipation: messagesUpdates[m].questionsParticipation,
						answers: messagesUpdates[m].answers,
					},
					{ merge: true }
				)
			)
		}
		await Promise.all(promiseUpdates)
		return null
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}

const updateOrCreateTree: any = async (messagesUpdates: any, db: any, subject: string, tree: any, questionsObjIncrement: any) => {
	try {
		//console.log(messagesUpdates)
		const formatedMessages: any = {}
		for (const m of Object.keys(messagesUpdates)) {
			formatedMessages[m] = {}
			formatedMessages[m].l = messagesUpdates[m].life
			formatedMessages[m].b = messagesUpdates[m].block
			formatedMessages[m].n = messagesUpdates[m].participation
			formatedMessages[m].a = messagesUpdates[m].approbation
			formatedMessages[m].u = messagesUpdates[m].unanimite
			formatedMessages[m].t = messagesUpdates[m].title
			if (messagesUpdates[m].parent !== "none") formatedMessages[m].p = messagesUpdates[m].parent
			if (messagesUpdates[m].connect) formatedMessages[m].co = messagesUpdates[m].connect
			formatedMessages[m].r = messagesUpdates[m].rank
			formatedMessages[m].id = messagesUpdates[m].id
			formatedMessages[m].ty = shortenType(messagesUpdates[m].type)
			formatedMessages[m].qp = messagesUpdates[m].questionsParticipation ? messagesUpdates[m].questionsParticipation : 0
			if(messagesUpdates[m].answers)formatedMessages[m].an = messagesUpdates[m].answers.map((a:any)=>{
				return {id:a.id,a:a.answered}
			})
			//console.log(formatedMessages[m])
		}
		await treeUtils.createOrUpdateTree(formatedMessages, db, subject, tree, questionsObjIncrement)
		return null
	} catch (error) {
		console.log(error)
		throw new Error(error)
	}
}
const shortenType: any = (type: string) => {
	if (type === "réponse") return "a"
	if (type === "remarque") return "r"
	if (type === "sondage") return "s"
	if (type === "critique") return "c"
	else {
		return null
	}
}

exports.getSortAndDeleteObsoletes = getSortAndDeleteObsoletes
exports.getAndUpdateUsersAndDeleteLastVotesTemp = getAndUpdateUsersAndDeleteLastVotesTemp
exports.getMessagesAndTitles = getMessagesAndTitles
exports.updateMessages = updateMessages
exports.updateOrCreateTree = updateOrCreateTree
exports.shortenType = shortenType
