<script>
  import Message from "./../Message.svelte";
  import Spinner from "svelte-spinner";
  import Bouton from "./../Boutons/bouton.svelte";
  import Response from "./../Response.svelte";
  import { params, goto } from "@sveltech/routify";
  import {
    titleMaxSize,
    contentMaxSize,
    maxNumberOfQuestions,
    trimmedResponses,
    iterator
  } from "./../scripts/textSizeLimitations.js";
  import { title, content, response } from "./../../../stores/textStore.js";
  import { messages, type } from "./../../../stores/messageStore.js";
  import { categories } from "./../../../stores/categoriesStore.js";
  import {
    showModal,
    reload,
    waitResponses,
    dev
  } from "./../../../stores/layoutTriggers.js";
  import { user, userDb } from "./../../../stores/user.js";
  import firebase, { db } from "./../../../_firebase.js";

  let errorMessage = "";
  let disabled = false;
  let success = "";
  let check = false;
  let id = $params.message ? $params.message : null;
  let m = $params.message ? $messages[$params.message] : null;
  let subcat = $params.subcategorie
    ? $categories[$params.categorie].subcat[$params.subcategorie]
    : null;
  const inputId = m ? m.id : subcat.id;
  const input = {};
  //si on a m, on est au moins au rang 1
  //si m.type===question et que $type === "sondage", alors on doit brancher sur le parent
  //si m.rank === 1, alors on doit créer un nouveau sujet
  input.title = $title[inputId];
  input.content = $content[inputId];
  input.subcategoryId = m ? m.subcategoryId : subcat.id;
  input.subject = m ? (m.rank === 0 ? id : m.subject) : "itself";
  input.parent = m
    ? m.type === "sondage" && $type === "sondage"
      ? m.parent
      : id
    : "none";
  input.rank = m
    ? m.type === "sondage" && $type === "sondage"
      ? m.rank
      : m.rank + 1
    : 0;
  let qttResponses = 2;
  let sentResponses, connect;

  if ($type === "sondage") {
    if (!$response[inputId]) $response[inputId] = [];
  }
  $: it = iterator(qttResponses);

  const send = async () => {
    try {
      console.log($type);
      disabled = true;
      if (
        ($type === "sondage"
          ? trimmedResponses($response[inputId]).length >= 2
          : true) &&
        $title[inputId].length > 0 &&
        $content[inputId].length > 0 &&
        $title[inputId].length <= titleMaxSize &&
        $content[inputId].length <= contentMaxSize
      ) {
        let res;
        let data = {
          user: $user.uid,
          type: $type ? $type : "remarque",
          title: $title[inputId],
          content: $content[inputId],
          date: firebase.firestore.Timestamp.now(),
          subcategoryId: input.subcategoryId,
          subject: input.subject,
          parent: input.parent,
          rank: input.rank,
          life: 0,
          block: 0,
          approbation: 0,
          unanimite: 0,
          participation: 0,
          locked: false
        };
        if ($type === "sondage")
        data.answers = trimmedResponses($response[inputId]).map(r => ({
          text: r
        }));
        if (connect && $type === "remarque") data.connect = connect;

        res = await db.collection("messages").add(data);

        $title[inputId] = "";
        $content[inputId] = "";
        response.set({});
        success = "envoyé";
        $userDb.votes[res.id] = {
          vote: "life"
        };
        waitResponses.set(res.id);
        reload.set(true);
        setTimeout(() => {
          showModal.set(false);
        }, 1500);
        let i = 0;
        if ($type === "sondage") {
          const int = setInterval(() => {
            console.log("ping");
            if (i >= 7) clearInterval(int);
            i++;
            db.collection("messages")
              .doc(res.id)
              .get()
              .then(res => {
                if (
                  res.exists &&
                  res.data().answers.reduce((a, v) => a && v.id)
                ) {
                  console.log(res.data().answers);
                  $messages[res.id].answers = res.data().answers;
                  waitResponses.set();
                  clearInterval(int);
                }
              })
              .catch(e => console.log(e));
          }, 2000);
        }
      } else {
        errorMessage = `Il doit y avoir un titre et un contenu${
          $type === "sondage" ? " et 2 réponses minimum" : ""
        }..`;
        disabled = false;
      }
    } catch (error) {
      errorMessage = error;
      disabled = false;
    }
  };
  const fakeId = () => {
    $messages["fake"] = {};
    const m = $messages["fake"];
    m.life = 1;
    m.block = 0;
    m.title = $title[inputId];
    m.content = $content[inputId];
    m.type = $type;
    m.id = "fake";
    if ($type === "sondage") {
      m.answers = trimmedResponses($response[inputId]).map(r => ({
        text: r,
        id: "fake"
      }));
    }
    return "fake";
  };
  const addResponse = e => {
    e.preventDefault();
    if (qttResponses < maxNumberOfQuestions) qttResponses = qttResponses + 1;
  };
</script>

<style>
  input {
    width: 100%;
    font-size: 0.9rem;
    border: none;
    margin-bottom: 1rem;
    border-bottom: 2px solid rgb(202, 202, 202);
    border-radius: 0px;
    padding: 1rem;
    transition: width 2s, height 4s;
  }
  input:focus {
    outline: none;
  }
  div {
    position: relative;
  }
  .button-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .button {
    margin: 1rem auto;
    border: none;
    background-color: green;
    border-radius: 6px;
    color: white;
    font-size: bold;
    width: 50%;
  }
  .error {
    color: red;
  }
  .success {
    color: green;
    font-weight: bold;
    font-size: 2rem;
  }
  p,
  h2 {
    text-align: center;
  }
  textarea {
    width: 100%;
    height: 300px;
  }
  div {
    position: relative;
  }
  .compteur {
    position: absolute;
    bottom: -10px;
    right: 30px;
    color: grey;
    font-size: 0.6rem;
  }
  textarea {
    width: 100%;
    height: 4rem;
    resize: vertical;
    outline: none;
  }
  .response-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>

{#if !success}
  <h2>
    Nouveau {$params.subcategorie ? ($type === 'remarque' ? 'sujet libre' : 'sondage') : $type === 'remarque' ? 'commentaire' : 'qcm'}
  </h2>
  {#if !check}
    <form on:submit|preventDefault={() => (check = true)}>
      <div>
        <input
          bind:value={input.title}
          type="text"
          required="required"
          placeholder={$type === 'sondage' ? 'Question' : 'Titre'}
          on:input={() => ((input.title = input.title.slice(0, titleMaxSize)), ($title[inputId] = input.title.trim()))} />
        {#if input.title}
          <p class="compteur">{titleMaxSize - input.title.length}</p>
        {/if}
      </div>
      {#if $type !== 'sondage' && $dev}
        <div>
          <input type="text" placeholder="connect to :" bind:value={connect} />
        </div>
      {/if}
      <div>
        <textarea
          bind:value={input.content}
          type="text"
          required="required"
          placeholder={$type === 'sondage' ? 'Complément...' : 'Votre message...'}
          on:input={() => ((input.content = input.content.slice(0, contentMaxSize)), ($content[inputId] = input.content.trim()))} />
        {#if input.content}
          <p class="compteur">{contentMaxSize - input.content.length}</p>
        {/if}
      </div>
      {#if $type === 'sondage'}
        <div class="response-header">
          <p>Choix de réponses (4 max) :</p>
          <Bouton name="ajouter" type="light" action={addResponse} />
        </div>
        {#each it as index}
          <Response subcatId={inputId} {index} />
        {/each}
      {/if}

      <div class="button-container">
        <input class="button" type="submit" value="Vérifier" />
      </div>

    </form>
  {:else}
    <Message id={fakeId()} border={true} noType={true} />
    <p class="error">{errorMessage}</p>
    <div class="button-container">
      <Bouton
        name="modifier"
        type="standard"
        action={() => {
          errorMessage = '';
          check = false;
        }} />
      {#if !disabled}
        <Bouton name="envoyer" type="light" action={send} />
      {:else}
        <Spinner size="30" speed="2000" color="green" thickness="2" gap="40" />
      {/if}
    </div>
  {/if}
{:else}
  <p class="success">{success}</p>
{/if}
