import {writable} from 'svelte/store'

export const showSidebar = writable(false)
export const showModal = writable('')
export const gotCategories = writable(false)
export const reload=writable(false)
export const waitResponses = writable()
export const dev = writable(false)
