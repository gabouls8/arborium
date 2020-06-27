<script>
	import { params } from '@sveltech/routify';
  import parseSort from "./../scripts/parseSort.js";
  import Bouton from "./bouton.svelte";
  export let action;
</script>

<style>
  div {
    display: flex;
    align-items: center;
  }
</style>

<div>
  <Bouton name="Tri : {parseSort($params.value, $params.order)}" type="light" {action} />
</div>
