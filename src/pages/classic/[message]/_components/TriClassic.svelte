<script>
	import ClassicSort from './../../../_components/Modal/ClassicSort.svelte';
	import { showModal } from './../../../../stores/layoutTriggers.js';
  import { sortClassic,active } from "./../../../../stores/classicStore.js";
  import parseSort from "./../../../_components/scripts/parseSort.js";
  import Bouton from "./../../../_components/Boutons/bouton.svelte";
  import { params } from "@sveltech/routify";

  const action = () => {
    showModal.set(ClassicSort);
  };
</script>

<style>
  .content {
    margin-top: 5px;
    display: flex;
    justify-content: center;
  }
</style>
<!-- {#if $sortClassic[$active]} -->
<div class="content">
  <Bouton
    name="Tri : {parseSort($sortClassic[$active].value, $sortClassic[$active].order)}"
    type="light"
    {action} />
</div>
<!-- {/if} -->
