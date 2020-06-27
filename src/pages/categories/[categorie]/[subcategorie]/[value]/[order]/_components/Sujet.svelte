<script>
  import Tooltip from "./../../../../../../_components/Tooltip.svelte";
  import Bouton from "./../../../../../../_components/Boutons/bouton.svelte";
  import { messages } from "./../../../../../../../stores/messageStore.js";
  import { color } from "./../../../../../../_components/scripts/color.js";
  import { params, goto } from "@sveltech/routify";
  export let id, hidetree;

  let m = $messages[id];

  const action = id => {
    $goto(`/classic/${id}`);
  };
  const redirect = () => {
    if (id === "fake") return;
    else {
      if($messages[id].subject==="itself")$goto(`/tree/${id}`)
      else $goto(`/tree/${$messages[id].subject}`);
    }
  };
</script>

<style>
  .container {
    border-radius: 6px;
    padding: 12px;
    max-height: calc(0.7 * (100vh - 64px));
    overflow-y: scroll;
    box-sizing: border-box;
  }
  .container::-webkit-scrollbar {
    display: none;
  }
  .container:hover {
    padding: 10px;
    border: 2px solid blue;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    width: 100%;
    font-size: 1rem;
    word-wrap: break-word;
  }
  .container:hover {
    cursor: pointer;
  }

  p {
    word-wrap: break-word;
    white-space: pre-wrap;
    margin: 0;
    font-size: 0.8rem;
  }
  span {
    font-style: italic;
    color: #800000;
    font-weight: 500;
    font-size: 0.8rem;
  }
</style>

{#if m}
  <div
    class="container"
    style="border-color:{m.block === 0 ? color(1) : color(m.life / (m.block + m.life))}"
    on:click={() => action(id)}>
    <div class="header">
      <h2>
        <Tooltip {m} />
        {#if $params.subcategorie === 'all'}
          <span>
            {m.type === 'remarque' ? (m.rank === 0 ? 'sujet libre' : 'remarque') : m.type === 'sondage' && m.rank === 0 ? 'sondage' : 'qcm'}
          </span>
        {/if}
        {m.title}
      </h2>
      {#if !hidetree}
      <Bouton img="/tree.svg" action={redirect} type="light"/>
      {/if}

    </div>
    <p>
      {m.content !== undefined ? m.content
            .split('\n')[0]
            .trim()
            .slice(0, 100) + '...' : ''}
    </p>
  </div>
{/if}
