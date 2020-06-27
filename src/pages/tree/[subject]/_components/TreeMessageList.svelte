<script>
	import {db} from './../../../../_firebase.js';
  import Message from "./../../../_components/Message.svelte";
  import TreeMessage from "./TreeMessage.svelte";
  import Degrade from "./../../../_components/Degrade.svelte";
  import { goto } from "@sveltech/routify";
  import { messages } from "./../../../../stores/messageStore.js";
  import Votes from "./../../../_components/Boutons/votes.svelte";
  import { color, lighten } from "./../../../_components/scripts/color.js";
  import { showModal } from "./../../../../stores/layoutTriggers.js";
  import Bouton from "./../../../_components/Boutons/bouton.svelte";
  import { currentMessage } from "./../../../../stores/treeStore.js";

  let node = $currentMessage;
  let ancestors = node.ancestors();
  ancestors.shift();

  const getMessage = async () => {
    try {
      const doc = await db
        .collection("messages")
        .doc(node.data.id)
        .get();
      if (doc.exists) {
        $messages[node.data.id] = { ...doc.data(), id: doc.id };
      } else console.log("le document n'existe pas");
    } catch (error) {
      console.log(error);
    }
  };

  if (node.data.ty!=="a"&&!$messages[node.data.id]) {
      getMessage();
  }
</script>

<style>
  h3 {
    margin: 1rem 0;
    text-align: center;
  }
  img {
    height: 40px;
    margin: 5px 0;
  }
  .center {
    display: flex;
    justify-content: center;
  }
  .close {
    padding: 2rem 0;
  }
</style>

<div class="center close">
  <Bouton name="Fermer" type={'light'} action={() => showModal.set(false)} />
</div>
<div class="center">
  <img src="/leaf.svg" alt="" />
</div>
<h3>Message selectionné :</h3>
<Message {node} border={true} spinner={true} />
{#if ancestors.length > 0}
  <div class="center">
    <img src="/branch.svg" alt="" />
  </div>
  <h3>Branche antérieure :</h3>
  {#each ancestors as ancestor}
    {#if ancestor && ancestor.data && ancestor.data.t}
      <TreeMessage node={ancestor} border={true} />
      <div class="center">
        {#if ancestor.parent}
          <img src="/branch.svg" alt="" style="height:20px;" />
        {/if}
      </div>
    {/if}
  {/each}
{/if}
<div class="center">
  <img src="/seed.svg" alt="" />
</div>
<div class="center close">
  <Bouton name="Fermer" type={'light'} action={() => showModal.set(false)} />
</div>
