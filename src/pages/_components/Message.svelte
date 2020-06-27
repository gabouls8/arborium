<script>
  import Tooltip from "./Tooltip.svelte";
  import NeedAccount from "./Modal/NeedAccount.svelte";
  import firebase, { db } from "./../../_firebase.js";
  import NewMessageForm from "./Modal/newMessageForm.svelte";
  import { userDb, user } from "./../../stores/user.js";
  import { waitResponses, showModal } from "./../../stores/layoutTriggers.js";
  import Spinner from "svelte-spinner";
  import Bouton from "./Boutons/bouton.svelte";
  import { defaultValues } from "./scripts/parseSort.js";
  import { messages, type } from "./../../stores/messageStore.js";
  import { colorr } from "./scripts/color.js";
  import Votes from "./Boutons/votes.svelte";
  import { goto, page, isActive } from "@sveltech/routify";
  export let id, tree, node, grey, border, question, noType, spinner;

  let fetching = false;
  let m = $messages[id];
  $: if (node && node.data.id && $messages[node.data.id]) {
    id = node.data.id;
    m = $messages[id];
  }
  //$:if(id)m=messages[id]

  const action = id => {
    showModal.set();
    $goto(`/classic/${id}`);
    // $goto(`/message/${id}/${defaultValues.value}/${defaultValues.order}`);
  };
  const redirect = () => {
    if (id === "fake") return;
    else {
      showModal.set();
      $goto(`/tree/${$messages[id].subject}`);
    }
  };

  const answer = async resId => {
    if (id === "fake") return;
    else {
      await sendVote(resId);
      //$goto(`/message/${resId}/date/desc`);
      $goto(`/classic/${resId}`);
    }
  };
  const getMessage = async idd => {
    try {
      fetching = true;
      const mdata = await db
        .collection("messages")
        .doc(idd)
        .get();
      if (mdata.exists) {
        const mm = mdata.data();
        $messages[idd] = mm;
        fetching = false;
        return mm.content;
      } else return "La requete n'a rien renvoyé";
    } catch (e) {
      return e;
    }
  };

  const sendVote = async resId => {
    try {
      if (!$user) {
        showModal.set(NeedAccount);
        return null;
      }
      const userRef = db.collection("users").doc($user.uid);
      const votesTemp = userRef.collection("votesTemp");
      const answersId = m.answers.map(a => a.id);
      let currentVote;
      if ($userDb.answers && $userDb.answers[id])
        currentVote = $userDb.answers[id].vote;
      console.log("currentvote");
      console.log(currentVote);
      if (!currentVote || currentVote !== resId) {
        console.log("send new vote");
        console.log("send ", resId);
        const res = await votesTemp.add({
          message: id,
          subject: m.subject === "itself" ? m.id : m.subject,
          vote: resId,
          date: firebase.firestore.Timestamp.now(),
          user: $user.uid
        });
        if (res) {
          console.log("res");
          if (!$userDb.answers) $userDb.answers = {};
          if (!$userDb.answers[id]) {
            $userDb.answers[id] = { vote: resId };
          } else {
            $userDb.answers[id].vote = resId;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const newCrit = () => {
    type.set("critique");
    if ($page.path.split("/")[1] !== "classic") $goto(`/classic/${id}`);
  };
  const newSond = () => {
    type.set("sondage");
    if ($page.path.split("/")[1] !== "classic") $goto(`/classic/${id}`);
  };
  // const colorr = () => {
  //   console.log(m);
  //   if (m && m.life >= 0) {
  //     return m.block === 0 ? color(1) : color(m.life / (m.block + m.life));
  //   }
  //   if (node) {
  //     return color(node.data.a / 100);
  //   }
  //   return "grey";
  // };
  const decode = c => {
    if (c === "a") return "réponse";
    if (c === "r") return "remarque";
    if (c === "s") return "sondage";
    if (c === "c") return "critique";
    return null;
  };
</script>

<style>
  .container {
    border: 2px solid grey;
    border-radius: 6px;
    padding: 10px;
    max-height: calc(0.7 * (100vh - 64px));
    overflow-y: scroll;
  }
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    max-width: 100%;
    font-size: 1rem;
    word-wrap: break-word;
  }
  h2:hover {
    cursor: pointer;
  }

  p {
    word-wrap: break-word;
    white-space: pre-wrap;
    margin: 0;
  }
  img {
    height: 25px;
  }
  img:hover {
    cursor: pointer;
  }
  .reponses {
    display: flex;
    justify-content: space-evenly;
    margin: 1rem 0 0 0;
  }
  span {
    font-style: italic;
    color: #800000;
    font-weight: 500;
    font-size: 0.8rem;
  }
  .bouton {
    display: flex;
    flex-direction: column;
  }
  .visite {
    margin: 0 auto;
    margin-top: 5px;
  }
  .reac {
    display: flex;
    justify-content: center;
  }
  .grey {
    color: grey;
  }
  .flex-center{
    display:flex;
    width:100%;
    justify-content: center;
  }
</style>

{#if (m && m.type !== 'réponse') || (m && question) || node}
  <div
    class="container"
    style="border:{border ? '2px solid grey' : 'none'}; border-color:{grey ? 'grey' : colorr(
          { m, node, question }
        )};">
    <!-- -------------------------votes------------------------- -->
    <div class={`header ${grey ? 'grey' : ''}`}>
      {#if !grey && !(m && m.id === 'fake')}
        <Votes messageId={id ? id : node.data.id} {question} {node} />
      {/if}
      <!-- -------------------------barre de titre------------------------- -->
      <h2 on:click={() => action(id ? id : node.data.id)}>
        <Tooltip {m} {grey} {node} {question} />
        {#if !noType}
          <span class={grey ? 'grey' : ''}>
            {m && m.type ? m.type : decode(node.data.ty)}
          </span>
        {/if}
        {m && m.title ? m.title : node.data.t}
      </h2>
      {#if tree}
        <img src="/tree.svg" alt="" on:click={redirect} />
      {/if}

    </div>
    <!-- -------------------------contenu------------------------- -->
    {#if m}
      <p class={grey ? 'grey' : ''}>
        {m.content !== undefined ? m.content : ''}
      </p>
    {:else if $messages[node.data.id] && node.data.ty !== 'a'}
      <p class={grey ? 'grey' : ''}>{$messages[node.data.id].content}</p>
    {:else if !$messages[node.data.id] && spinner && node.data.ty !== 'a'}
      <div class="flex-center">
        <Spinner size="30" speed="2000" color="green" thickness="2" gap="40" />
      </div>
    {:else if !fetching && node.data.ty !== 'a'}
      <Bouton
        name="Voir contenu"
        type="slim"
        action={() => getMessage(node.data.id)} />
    {:else if node.data.ty !== 'a'}
      <p>Requête en cours..</p>
    {/if}
    <!-- -------------------------réponses------------------------- -->
    {#if m && m.type === 'sondage'}
      {#if !grey}
        <div class="reponses">
          {#if $waitResponses !== id || (!$waitResponses && !id)}
            {#each m.answers as reponse}
              <div class="bouton">
                <Bouton
                  name={reponse.text}
                  type={$userDb.answers && $userDb.answers[id] && $userDb.answers[id].vote === reponse.id ? 'standard answer answered' : 'light answer'}
                  action={() => answer(reponse.id)} />
                <!-- <div class="visite">
                  {#if !$isActive(`/classic/${reponse.id}`)}
                    <Bouton
                      name="Voir les réactions"
                      type="slim grey"
                      action={() => {
                        showModal.set();
                        $goto(`/classic/${reponse.id}`);
                      }} />
                  {/if}
                </div> -->
              </div>
            {/each}
          {:else}
            <Spinner
              size="30"
              speed="2000"
              color="green"
              thickness="2"
              gap="40" />
          {/if}
        </div>
      {/if}
    {/if}
  </div>
{/if}
