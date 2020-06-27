import {writable} from 'svelte/store'

export const tree=writable({})
export const parametres =writable({})
export const currentMessage = writable()
export const reloaded = writable()