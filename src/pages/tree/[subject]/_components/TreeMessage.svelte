<script>
	import Spinner from 'svelte-spinner';
  import Tooltip from "./../../../_components/Tooltip.svelte";
  import { db } from "./../../../../_firebase.js";
  import { showModal } from "./../../../../stores/layoutTriggers.js";
  import Bouton from "./../../../_components/Boutons/bouton.svelte";
  import { messages } from "./../../../../stores/messageStore.js";
  import { goto } from "@sveltech/routify";
  import Votes from "./../../../_components/Boutons/votes.svelte";
  import { color } from "./../../../_components/scripts/color.js";

  export let node;
  let fetching = false;

  const action = () => {
    showModal.set();
    $goto(`/classic/${node.data.id}`);
  };

  const getMessage = async id => {
    try {
      fetching = true;
      const mdata = await db
        .collection("messages")
        .doc(id)
        .get();
      if (mdata.exists) {
        const m = mdata.data();
        $messages[id] = m;
        fetching = false;
        return m.content;
      } else return "La requete n'a rien renvoyé";
    } catch (e) {
      return e;
    }
  };
</script>

<style>
  .container {
    border-radius: 6px;
    padding: 12px;
    max-height: calc(0.7 * (100vh - 64px));
    overflow-y: scroll;
    background-color: white;
  }
  .container:hover {
    padding: 10px;
    border: 2px solid grey;
  }
  .header {
    display: flex;
    flex-wrap: wrap;

    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  h3 {
    font-size: 1rem;
    margin: 0;
    max-width: 100%;
    word-wrap: break-word;
  }
  h3:hover {
    cursor: pointer;
  }

  p {
    word-wrap: break-word;
    white-space: pre-wrap;
    margin: 0;
    font-size: 0.8rem;
  }
  .flex-center{
    display:flex;
    width:100%;
    justify-content: center;
  }
</style>

{#if node}
  <div class="container" style="border-color:{color(node.data.a / 100)}">
    <div class="header">
      <h3 on:click={action}>
        <Tooltip {node} />
        {node.data.t}
      </h3>
    </div>
    {#if $messages[node.data.id] && node.data.ty !== 'a'}
      <p>{$messages[node.data.id].content}</p>
    {:else if !fetching && node.data.ty !== 'a'}
      <Bouton
        name="Voir contenu"
        type="slim"
        action={() => getMessage(node.data.id)} />
    {:else if node.data.ty !== 'a'}
      <div class="flex-center">
        <Spinner size="30" speed="2000" color="green" thickness="2" gap="40" />
      </div>
    {/if}
  </div>
{/if}
