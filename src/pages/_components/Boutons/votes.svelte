<script>
	import { counter } from './../scripts/parseSort.js';
  import { params } from "@sveltech/routify";
  import { categories } from "./../../../stores/categoriesStore.js";
  import { messages } from "./../../../stores/messageStore.js";
  import { color } from "./../scripts/color.js";
  import NeedAccount from "./../Modal/NeedAccount.svelte";
  import firebase, { db } from "./../../../_firebase.js";
  import { user, userDb } from "./../../../stores/user.js";
  import { showModal } from "./../../../stores/layoutTriggers.js";
  export let  messageId,question,node;

  let selected;
  let counterText


  const assignVotes = userDb => {
    //console.log("triggered");
    if (userDb.votes[messageId]) {
      //console.log("triggered in");
      //console.log(userDb);
      //console.log($userDb.votes)
      selected = !userDb.votes[messageId]
        ? "none"
        : userDb.votes[messageId].vote;
      // console.log(selected);
    } else {
      selected = "none";
    }
  };
  $: assignVotes($userDb);

  const sendVote = () => {
    if (!$user) {
      selected = "none";
      return showModal.set(NeedAccount);
    }
    //console.log(selected);
    const userRef = db.collection("users").doc($user.uid);
    const votesTemp = userRef.collection("votesTemp");
    if (
      !$userDb.votes ||
      !$userDb.votes[messageId] ||
      $userDb.votes[messageId].vote !== selected.id
    ) {
      if (
        selected.id === "none" &&
        $userDb.votes &&
        !$userDb.votes[messageId]
      ) {
        return console.log("non pris en compte");
      }
      console.log($messages[messageId].subject==="itself"?messageId:$messages[messageId].subject)
      votesTemp
        .add({
          message: messageId,
          subject: $messages[messageId].subject==="itself"?messageId:$messages[messageId].subject,
          vote: selected,
          date: firebase.firestore.Timestamp.now(),
          user: $user.uid
        })
        .then(() => {
          console.log("sent to db");
          if (!$userDb.votes[messageId]) {
            $userDb.votes[messageId] = { vote: selected };
          } else {
            $userDb.votes[messageId].vote = selected;
          }
        })
        .catch(e => {
          console.error(e);
        });
    } else {
      console.log("déja voté");
    }
  };
</script>

<style>
  .up {
    background-color: #18bd00;
  }
  .down {
    background-color: #310001;
  }
  .votebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .counters {
    color: grey;
    font-size: 0.7rem;
    margin: 0;
  }
  .select-wrapper {
    display: flex;
    align-items: center;
  }

  select::-ms-expand {
    display: none;
  }
  select {
    border: 1px solid #f4f4f4;
    text-align: center;
    margin: 0;
    border-radius: 6px;
    padding: 5px;
    font-size: 1rem;
    color: #3f3f3f;

    /* Here's the code we need */
    -webkit-appearance: none;
    -moz-appearance: none;
    -ms-appearance: none;
    -o-appearance: none;
    appearance: none;
  }
  select:focus {
    outline: none;
  }
  .life {
    background-color: #18bd00;
    color: white;
    font-size: bold;
  }
  .block {
    background-color: #310001;
    color: white;
    font-size: bold;
  }
  span {
    color: grey;
    font-size: 0.7rem;
  }
</style>

<div class="votebar">
  {#if $messages[messageId]}
  <p class="counters">
    {counter({m:$messages[messageId],question,node})}
  </p>
    <div class="select-wrapper">
      {#if !$messages[messageId].locked && $messages[messageId].type!=="réponse"}
        <span>{$messages[messageId].type==="sondage"?"Bonne question? ":"Votre vote: "}</span>
        <select bind:value={selected} on:change={sendVote} class={selected}>
          <option
            class="life"
            value="life"
            selected={'life' === selected ? 'selected' : ''}>
            {$messages[messageId].type==="sondage"?"Oui":"Positif"}
          </option>
          <option
            class="block"
            value="block"
            selected={'block' === selected ? 'selected' : ''}>
            {$messages[messageId].type==="sondage"?"Non":"Negatif"}
          </option>
          <option
            class="none"
            value="none"
            selected={'none' === selected ? 'selected' : ''}>
            {$messages[messageId].type==="sondage"?"Pas d'avis":"Pas de vote"}
          </option>
        </select>
      {:else if $messages[messageId].locked}
        <p class="counters">Votes verrouillés pour ce sujet</p>
        {:else if $messages[messageId].type==="réponse"}
        {#if $userDb.answers && $userDb.answers[$messages[messageId].parent]&& $userDb.answers[$messages[messageId].parent].vote===messageId}
        <p class="counters">C'est votre réponse</p>
        {:else}
        <p class="counters">Ce n'est pas votre réponse</p>
        {/if}
      {/if}
    </div>
  {/if}
</div>
