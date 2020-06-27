<script>
	import Message from './../../_components/Message.svelte';
  import Tabs from "./../../_components/Tabs.svelte";
  import { categories } from "./../../../stores/categoriesStore.js";
  import Bouton from "./../../_components/Boutons/bouton.svelte";
  import { sortClassic } from "./../../../stores/classicStore.js";
  import { tabs } from "./../../_components/scripts/parseSort.js";
  import Degrade from "./../../_components/Degrade.svelte";
  import { lighten, color,colorr } from "./../../_components/scripts/color.js";
  import { db } from "./../../../_firebase.js";
  import { goto } from "@sveltech/routify";
  import { messages } from "./../../../stores/messageStore.js";
  export let scoped;

  const initTabs = mess => {
    tabs[mess.type].forEach(t => {
      if (!$sortClassic[t]) $sortClassic[t] = { value: "date", order: "desc" };
    });
  };

  let id;
  let question, current, value, order, promiseMessage;
  let m;
  let bgcolor = "white";

  $: if (scoped.id) {
    id = scoped.id;
    question = undefined;
  }

  const getQuestion = async id => {
    try {
      console.log("get question");
      let data = await db
        .collection("messages")
        .doc(id)
        .get();
      if (data.exists) {
        $messages[id] = { ...data.data(), id: data.id };
      } else {
        $goto("./crash");
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  };

  const init = async () => {
    try {
      //Si $currentMessage et si il n'est pas dans subjects, c'est que c'est un sujet, donc on le met dans messageStore
      if ($messages[id] && $messages[id].type !== "réponse") {
        console.log("j'ai deja et ce n'est pas une réponse");
        initTabs($messages[id]);
        m = $messages[id];
        return "render";
      } else if ($messages[id] && $messages[id].type === "réponse") {
        console.log("j'ai deja la réponse");
        initTabs($messages[id]);
        m = $messages[id];
        console.log($messages[id].parent);
        if (!$messages[$messages[id].parent]) {
          console.log("je n'ai pas la question");
          await getQuestion($messages[id].parent);
        } else {
          console.log("j'ai deja la question");
        }
        question = { ...$messages[$messages[id].parent] };
      }
      //  si on ne vient pas d'un sujet, (par ex. de l'arbre ou autre) alors on fetche
      else {
        // console.log("je n'ai pas le message");
        console.log("get message");
        const data = await db
          .collection("messages")
          .doc(id)
          .get();

        if (data.exists) {
          $messages[id] = { ...data.data(), id: data.id };
          initTabs($messages[id]);
          m = $messages[id];

          if (data.data().type === "réponse") {
            console.log("c'est une réponse");
            let questionId = data.data().parent;
            if (!$messages[questionId]) {
              console.log("je n'ai pas la question");

              await getQuestion(questionId);
            } else console.log("j'ai déja la question");
            question = { ...$messages[questionId] };
          } else console.log("ce n'est pas une réponse");

          return "render";
        } else {
          //pas de data
          $goto("./crash");
          throw new Error("aille");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  $: if (id) promiseMessage = init(id);
  $: if (m && m.type !== "réponse")
    bgcolor =
      m.block === 0
        ? lighten(color(1))
        : lighten(color(m.life / (m.block + m.life)));
  $: if (m && m.type === "réponse" && question)
    bgcolor = lighten(colorr({m,question}));
  const revenir = () => {
    if (m.parent === "none") {
      const scid = m.subcategoryId;
      for (const categ in $categories) {
        // console.log(categ, "  ", scid);
        if (scid in $categories[categ].subcat) {
          $goto(`/categories/${categ}/${scid}/date/desc`);
        }
      }
    } else $goto(`/classic/${m.parent}`);
  };

  const arboText = () => {
    //$goto(`/message/${id}/date/desc`);
  };
</script>

<style>
  .wrapper {
    width: 100%;
    box-sizing: border-box;
    padding: 1rem 2rem;
  }
  .current {
    background-color: white;
    border-radius: 6px;
    opacity: 1;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .left {
    width: calc(100vw - 200px);
    left: 200px;
  }
  @media (max-width: 780px) {
    .wrapper {
      padding: 1rem 0.8rem;
    }
    .left {
      left: 0;
      width: 100vw;
    }
  }
  .grey:hover{
    background-color: #f4f4f4;
    cursor:pointer;
  }
</style>

{#await promiseMessage then go}
  {#if m&&m.type!=="réponse"||m&&question}
    {#if question}
      <div class="wrapper grey" on:click={()=>$goto(`/classic/${question.id}`)}>
        <Message id={question.id} grey={true} />
      </div>
    {/if}
    <Degrade />
    <div class="wrapper" style="background-color:{bgcolor}">
      <div class="current">
        <Message {id} {question} />
      </div>
    </div>
    <Degrade />
    <Tabs {m} {id} />
    <div class="bottom left">
      <Bouton
        name={m.rank === 0 ? 'Revenir aux sujets' : 'Niveau inférieur'}
        type="slim "
        action={revenir} />
      <Bouton
        type="light round big"
        img="/tree.svg"
        action={() => $goto(`/tree/${m.subject!=="itself"?m.subject:m.id}`)} />
      <Bouton name={`niveau ${m.rank}`} type="slim " action={arboText} />
    </div>
  {/if}
{/await}
