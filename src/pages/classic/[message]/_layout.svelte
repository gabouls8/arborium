<script>
	import { active } from './../../../stores/classicStore.js';
  import { params } from "@sveltech/routify";

  let id;
  $: if ($params && $params.message) {
    active.set()
    id = $params.message;
    // console.log('changing page',id)
  }
</script>

<!-- {#if id} -->
  <slot scoped={{ id }} />
<!-- {/if} -->
