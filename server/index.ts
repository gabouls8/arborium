import * as functions from "firebase-functions"
//const treeUtils = require("./treeUtils")
//const treeUtils = require("./treeUtils")
// import * as d3 from "d3"
// const util = require("util")
// const { stringify, parse } = require("flatted")

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

// The Firebase Admin SDK to access Cloud Firestore.
import * as admin from "firebase-admin"
admin.initializeApp()

const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

exports.handleRoles = functions
	.region("europe-west1")
	.firestore.document("messages/{message}/roles/{role}")
	.onWrite(async (change, context) => {
		try {
			const roleAfter: any = change.after.data()
			if(!roleAfter)return null
			// console.log(roleBefore)
			// console.log("----------------------------------------")
			//console.log(roleAfter)
			// console.log(newEntries)
			if (roleAfter.firstAdmin) {
				const firstAdminId: any = roleAfter.admins[0]
				// console.log("firstTime")
				const res: any = await db.collection("users").doc(firstAdminId).get()
				return change.after.ref.set(
					{ emails: { [firstAdminId]: res.data().email }, firstAdmin: admin.firestore.FieldValue.delete() },
					{ merge: true }
				)
			} else if (roleAfter.newViewers) {
				// console.log("newViewers")
				const promiseUsers: any = []
				roleAfter.newViewers.forEach((nv: any) => {
					promiseUsers.push(db.collection("users").where("email", "==", nv).get())
				})
				const res: any = await Promise.all(promiseUsers)
				// console.log(res)
				res.forEach((ud: any, i: any) => {
					if (ud.empty) {
						// console.log("empty")
					} else {
						// console.log(ud.docs[0].id)
						// console.log(roleAfter.users[newEntries[i]])

						roleAfter.viewers.push(ud.docs[0].id)
						// console.log(roleAfter.viewers)
						roleAfter.emails[ud.docs[0].id] = roleAfter.newViewers[i]
						// console.log(roleAfter.emails)
					}
				})
				delete roleAfter.newViewers
				// console.log(roleAfter)
				return change.after.ref.set({ ...roleAfter })
			}
			return null
		} catch (error) {
			console.log(error)
			throw new Error(error)
		}
	})

exports.initMessage = functions
	.region("europe-west1")
	.firestore.document("messages/{message}")
	.onCreate(async (snap, context) => {
		try {
			const message = snap.data()
			// console.log(message)
			const messageId: string = snap.id
			const userRef = db.collection("users").doc(message.user)
			const voteTempRef = userRef.collection("votesTemp")
			let subject: string = message.subject

			const promise = []
			let answers: any = []
			if (message.type === "sondage") {
				// console.log("sondage")
				const answerPromise: any = []
				message.answers.forEach((a: any) => {
					answerPromise.push(
						db.collection("messages").add({
							type: "réponse",
							title: a.text,
							date: message.date,
							subcategoryId: message.subcategoryId,
							subject: message.subject === "itself" ? messageId : message.subject,
							parent: messageId,
							rank: message.rank + 1,
							life: 0,
							block: 0,
							approbation: 0,
							unanimite: 0,
							participation: 0,
							locked: false,
							user: message.user,
						})
					)
				})
				answers = await Promise.all(answerPromise)
				// console.log("liste des id des réponses")
				// console.log(answers.map((res:any)=>res.id))
			}
			if (subject === "itself") {
				subject = snap.id
				const update: any = { subject, user: admin.firestore.FieldValue.delete() }
				if (!message.public) {
					promise.push(
						snap.ref
							.collection("roles")
							.doc(subject)
							.set({ admins: [message.user], viewers: [message.user], emails: {}, firstAdmin: true, title: message.title,date:message.date })
							.catch(e => console.log(e))
					)
				}
				if (message.answers)
					update.answers = message.answers.map((a: any, i: any) => {
						return { ...a, id: answers[i].id }
					})
				promise.push(
					snap.ref
						.set({ ...update }, { merge: true })
						.then(res => {
							// console.log(`subject field updated and user deleted `)
						})
						.catch(err => {
							console.log(`Failed to update subject: ${err}`)
						})
				)
			} else {
				const update: any = { user: admin.firestore.FieldValue.delete() }
				if (message.answers)
					update.answers = message.answers.map((a: any, i: any) => {
						return { ...a, id: answers[i].id }
					})
				promise.push(
					snap.ref
						.set({ ...update }, { merge: true })
						.then(res => {
							// console.log(`user deleted`)
						})
						.catch(err => {
							// console.log(`Failed to delete user: ${err}`)
						})
				)
			}
			promise.push(
				voteTempRef
					.add({
						message: messageId,
						subject: subject,
						vote: message.type === "réponse" ? "none" : "life",
						date: message.date,
						user: message.user,
						fromFunc: true,
						// nr:message.type,
						// q:message.type === "réponse" ? message.parent:null,
					})
					.then(res => {
						// console.log(`VoteTemp successfully created`)
					})
					.catch(err => {
						console.log(`Failed to create voteTemp: ${err}`)
					})
			)
			await Promise.all(promise)
			return null
		} catch (error) {
			// console.log(error)
			throw new Error(error)
		}
	})

exports.scheduled = functions
	.region("europe-west1")
	.pubsub.schedule("every 2 minutes")
	.onRun(async context => {
		try {
			const votes = require("./votes")
			const manageSubject: any = async (vtGroupedBySubject: any) => {
				try {
					const subject = vtGroupedBySubject[0].subject
					if (subject === "itself") {
						return null
					}
					const seed: any = vtGroupedBySubject.find((d: any) => d.subject === d.message)
					const treedata: any = await db.collection("tree").doc(subject).get()
					if (!seed && !treedata.data()) {
						return null
					}
					const { users, votesTempCopy } = await votes.getSortAndDeleteObsoletes(vtGroupedBySubject, db)
					await votes.getAndUpdateUsersAndDeleteLastVotesTemp(users, votesTempCopy, db)
					if (!votesTempCopy.updates) {
						return null
					}
					const messagesUpdates = await votes.getMessagesAndTitles(votesTempCopy, db)
					const promise = [
						votes.updateMessages(messagesUpdates, db),
						votes.updateOrCreateTree(messagesUpdates, db, subject, treedata.data()),
					]
					await Promise.all(promise)
					return null
				} catch (error) {
					console.log(error)
					throw new Error(error)
				}
			}

			const parallel: any = []
			const data = await db.collectionGroup("votesTemp").orderBy("user").orderBy("message").orderBy("date", "desc").get()
			const groupedBySubject = groupBySubject(data)
			for (const subject of Object.keys(groupedBySubject)) {
				parallel.push(manageSubject(groupedBySubject[subject]))
			}
			await Promise.all(parallel)
			return null
		} catch (error) {
			console.log(error)
			return error
		}
	})

// exports.handtriggeredtrees = functions.region("europe-west1").https.onRequest(async (req, res) => {
// 	try {
// 		const votes = require("./votes")
// 		const manageSubject: any = async (vtGroupedBySubject: any) => {
// 			try {
// 				const subject = vtGroupedBySubject[0].subject
// 				if (subject === "itself") {
// 					return null
// 				}
// 				const seed: any = vtGroupedBySubject.find((d: any) => d.subject === d.message)
// 				console.log("found seed")
// 				const treedata: any = await db.collection("tree").doc(subject).get()
// 				if (!seed && !treedata.data()) {
// 					return null
// 				}
// 				const { users, votesTempCopy } = await votes.getSortAndDeleteObsoletes(vtGroupedBySubject, db)
// 				await votes.getAndUpdateUsersAndDeleteLastVotesTemp(users, votesTempCopy, db)
// 				if (!votesTempCopy.updates) {
// 					return null
// 				}
// 				const messagesUpdates = await votes.getMessagesAndTitles(votesTempCopy, db)
// 				const promise = [
// 					votes.updateMessages(messagesUpdates, db),
// 					votes.updateOrCreateTree(messagesUpdates, db, subject, treedata.data()),
// 				]
// 				await Promise.all(promise)
// 				return null
// 			} catch (error) {
// 				console.log(error)
// 				throw new Error(error)
// 			}
// 		}
// 		const parallel: any = []
// 		const data = await db.collectionGroup("votesTemp").orderBy("user").orderBy("message").orderBy("date", "desc").get()
// 		const groupedBySubject = groupBySubject(data)
// 		for (const subject of Object.keys(groupedBySubject)) {
// 			parallel.push(manageSubject(groupedBySubject[subject]))
// 		}
// 		await Promise.all(parallel)
// 		res.send("ok")
// 	} catch (error) {
// 		console.log(error)
// 		res.send(error)
// 	}
// })

// exports.rebuildAllTrees = functions.region("europe-west1").https.onRequest(async (req, res) => {
// 	try {
// 		const subjectData: any = await db.collection("messages").where("rank", "==", 0).get()
// 		const subjects = subjectData.docs.map((sd: any) => sd.id)

// 		subjects.forEach(async (s: any) => {
// 			try {
// 				console.log(s)
// 				const data = await db.collection("messages").where("subject", "==", s).get()
// 				const messages = data.docs.map(d => ({ ...d.data(), id: d.id }))
// 				const messagesUpdates: any = {}
// 				for (const mess of messages) {
// 					messagesUpdates[mess.id] = mess
// 				}

// 				//console.log(messagesUpdates)
// 				const formatedMessages: any = {}
// 				for (const m of Object.keys(messagesUpdates)) {
// 					formatedMessages[m] = {}
// 					formatedMessages[m].l = messagesUpdates[m].life
// 					formatedMessages[m].b = messagesUpdates[m].block
// 					formatedMessages[m].n = messagesUpdates[m].participation
// 					formatedMessages[m].a = messagesUpdates[m].approbation
// 					formatedMessages[m].u = messagesUpdates[m].unanimite
// 					formatedMessages[m].t = messagesUpdates[m].title
// 					if (messagesUpdates[m].parent !== "none") formatedMessages[m].p = messagesUpdates[m].parent
// 					formatedMessages[m].r = messagesUpdates[m].rank
// 					formatedMessages[m].id = messagesUpdates[m].id
// 					formatedMessages[m].ty = votes.shortenType(messagesUpdates[m].type)
// 				}
// 				//console.log(formatedMessages)
// 				await treeUtils.createOrUpdateTree(formatedMessages,db,s)
// 				console.log("trees re-created")
// 			} catch (error) {
// 				console.log(error)
// 			}
// 		})

// 		res.send("ok")
// 	} catch (error) {
// 		console.log(error)
// 		res.send(error)
// 	}
// })

exports.faisdumenage = functions.region("europe-west1").https.onRequest(async (req, res) => {
	try {
		const data: any = await db.collection("messages").where("subcategoryId", "==", "029ad8dd-1d40-4142-8141-d18294d0fafa").get()
		//const data: any = await db.collection("messages").where("subcategoryId", "==", "da743bb8-9a97-448d-8abe-d19fadcec1c0").get()
		if (data.docs) {
			const messageIds: any = []
			const subjectIds: any = []
			for (const doc of data.docs) {
				messageIds.push(doc.id)
				if (!subjectIds.includes(doc.data().subject)) subjectIds.push(doc.data().subject)
			}
			const promise: any = []
			for (const mId of messageIds) {
				promise.push(db.collection("messages").doc(mId).delete())
			}
			for (const sId of subjectIds) {
				promise.push(db.collection("tree").doc(sId).delete())
				promise.push(db.collection("treelight").doc(sId).delete())
			}
			res.send("cleaned")
		} else res.send("nothing to clean")
	} catch (error) {
		res.send(error)
	}
})

const groupBySubject: any = (data: any) => {
	const grouped: any = {}
	for (let i = 0; i < data.docs.length; i++) {
		const vt = { ...data.docs[i].data(), id: data.docs[i].id }
		const subject: any = vt.subject
		if (!grouped[subject]) {
			grouped[subject] = []
		}
		grouped[subject].push(vt)
	}
	return grouped
}
