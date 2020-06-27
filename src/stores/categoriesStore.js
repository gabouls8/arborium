import { writable } from "svelte/store"

export const openedTabs = writable([]) //liste des catégories ouvertes dans la sidebar
export const currentSubcategory = writable({})
export const categories = writable()
export const subjects = writable({})
