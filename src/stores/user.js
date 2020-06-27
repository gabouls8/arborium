import { writable } from "svelte/store"


export const user=writable()
export const gotUser = writable(false)
export const userDb = writable({votes:{}})
