<script>
	import Message from './Message.svelte';
  import Sujet from "./../categories/[categorie]/[subcategorie]/[value]/[order]/_components/Sujet.svelte";
  import { categories } from "./../../stores/categoriesStore.js";
  import { params } from "@sveltech/routify";
  import NewMessageForm from "./Modal/newMessageForm.svelte";
  import NeedAccount from "./Modal/NeedAccount.svelte";
  import { showModal } from "../../stores/layoutTriggers";
  import { paginationNumber } from "./scripts/pagination.js";
  import { db } from "./../../_firebase.js";
  import { messages, type } from "./../../stores/messageStore.js";
  import { reload } from "./../../stores/layoutTriggers.js";
  import { user } from "./../../stores/user.js";
  import { fade } from "svelte/transition";
  import Bouton from "./Boutons/bouton.svelte";
  import TriClassic from "./../classic/[message]/_components/TriClassic.svelte";
  import { intro, tabs, code } from "./scripts/parseSort.js";
  import {
    active,
    trig,
    sortClassic,
    classic
  } from "./../../stores/classicStore.js";
  export let m, id, all, subcategorie;
  $: if (subcategorie) id = subcategorie;
  $: if (all) id = "all";

  let current, value, order;
  const opendefault = () => {
    if (all) {
      active.set("sujets libres");
      trig.update(t => t + 1);
    } else if (subcategorie) {
      //if (subcategorie === "a04f2f88-4153-48b3-b17a-18ce4e163bfe")
        active.set("sujets libres");
      //else active.set("sondages");
      trig.update(t => t + 1);
    } else if (m.type === "réponse") {
      active.set("qcm");
      trig.update(t => t + 1);
    } else {
      active.set("libre");
      trig.update(t => t + 1);
    }
  };
  $: if (m || all || subcategorie) opendefault();
  $: if ($trig && $active && $sortClassic[$active]) dispatch();
  $: if ($reload && $active && $sortClassic[$active]) {
    reload.set(false);
    dispatch();
  }

  const dispatch = async () => {
    value = $sortClassic[$active].value;
    order = $sortClassic[$active].order;
    //console.log("dispatch", value, order);

    if (!$classic[id]) $classic[id] = {};
    if (!$classic[id][value]) $classic[id][value] = {};
    if (!$classic[id][value][order]) $classic[id][value][order] = {};
    if (!$classic[id][value][order][$active])
      $classic[id][value][order][$active] = { refs: [] };
    current = $classic[id][value][order][$active];
    let idd;
    if (all || subcategorie) idd = id;
    else
      idd =
        m.type === "sondage" && $active === "sondages" && m.rank > 0
          ? m.parent
          : id;

    if (!current.refs || current.refs.length === 0)
      await getThings(undefined, undefined, idd);
    else if (value === "date" && order === "desc" && current.first)
      await getThings(current.first, undefined, idd);
    else return null;
  };

  const getThings = async (first, last, idd = id) => {
    try {
      //console.log(idd);
      let data;
      if (idd === "all") {
        if (last) {
          console.log("get all messages from last");
          data = await db
            .collection("messages")
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .startAfter(last)
            .get();
        } else if (value === "date" && order === "desc" && first) {
          console.log("get all messages before first");
          data = await db
            .collection("messages")
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, "asc")
            .startAfter(first)
            .get();
          //console.log(`got ${data.docs.length} new messages`);
          //on va devoir peut etre inverser l'ordre
        } else {
          console.log("get all messages");
          data = await db
            .collection("messages")
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .get();
        }
      } else if (subcategorie) {
        if (last) {
          console.log("get all messages from last");
          data = await db
            .collection("messages")
            .where("subcategoryId", "==", idd)
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .startAfter(last)
            .get();
        } else if (value === "date" && order === "desc" && first) {
          console.log("get all messages before first");
          data = await db
            .collection("messages")
            .where("subcategoryId", "==", idd)
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, "asc")
            .startAfter(first)
            .get();
          //console.log(`got ${data.docs.length} new messages`);
          //on va devoir peut etre inverser l'ordre
        } else {
          console.log("get all messages");
          data = await db
            .collection("messages")
            .where("subcategoryId", "==", idd)
            .where("rank", "==", 0)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .get();
        }
      } else {
        if (last) {
          console.log("get messages from last");
          data = await db
            .collection("messages")
            .where("parent", "==", idd)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .startAfter(last)
            .get();
        } else if (value === "date" && order === "desc" && first) {
          console.log("get messages before first");
          data = await db
            .collection("messages")
            .where("parent", "==", idd)
            .where("type", "==", code[$active])
            .orderBy(value, "asc")
            .startAfter(first)
            .get();
          //console.log(`got ${data.docs.length} new messages`);
          //on va devoir peut etre inverser l'ordre
        } else {
          console.log("get messages");
          data = await db
            .collection("messages")
            .where("parent", "==", idd)
            .where("type", "==", code[$active])
            .orderBy(value, order)
            .limit(paginationNumber)
            .get();
        }
      }

      let processedDocs = data.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(d => d.id !== idd);
      processedDocs.forEach(pd => {
        $messages[pd.id] = pd;
      });
      //console.log(processedDocs);
      if (!current.areMoreSubjects === undefined)
        current.areMoreSubjects = true;
      if (value === "date" && order === "desc" && first) {
        current.refs = [
          ...processedDocs.map(d => d.id).reverse(),
          ...current.refs
        ];
      } else {
        if (!current.refs) current.refs = [];
        current.areMoreSubjects = true;
        current.refs = [...current.refs, ...processedDocs.map(d => d.id)];
      }
      if (first && data.docs.length > 0) {
        current.first = data.docs[data.docs.length - 1];
        //console.log("set first" + current.first);
      } else {
        if (value === "date" && order === "desc") {
          if (!current.first) {
            current.first = data.docs[0];
            //console.log("set first" + current.first);
          }
        }
        if (data.docs.length < paginationNumber && !first) {
          //console.log("plus de messages");
          current.areMoreSubjects = false;
        }
        if (data.docs.length > 0) {
          current.last = data.docs[data.docs.length - 1];
          //console.log("set last" + current.last);
        }
      }
      if (all) legende();
      return null;
    } catch (error) {
      console.log(error);
    }
  };

  const add = () => {
    if ($user) {
      type.set(code[$active]);
      showModal.set(NewMessageForm);
    } else {
      showModal.set(NeedAccount);
    }
  };

  const action = () => {
    getThings(undefined, current.last);
  };
  let prevscid;
  let scid;
  let legarray = [];
  const legende = () => {
    for (let i = 0; i < current.refs.length; i++) {
      let id = current.refs[i];
      scid = $messages[id].subcategoryId;
      let sc;
      const leg = (() => {
        for (const categ in $categories) {
          if (scid in $categories[categ].subcat) {
            sc = $categories[categ].subcat[scid].name;
            //console.log(JSON.stringify({ cat: $categories[categ].name, sc }));
            return { cat: $categories[categ].name, sc };
            break;
          }
        }
      })();
      legarray[i] = { ...leg };
    }
    return true;
  };
</script>

<style>
  .wrapper {
    width: 100%;
    box-sizing: border-box;
    padding: 1rem 2rem;
  }

  .tabs {
    width: 100%;
    display: flex;
    justify-content: space-around;
    flex-flow: row wrap;
    align-items: stretch;
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 2;
  }
  .tab {
    color: brown;
    font-style: italic;
    background-color: #f4f4f4;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 3rem;
    border: 1px solid #e0e0e0;
    border-bottom: 2px solid #e0e0e0;
    border-top: none;
    flex-grow: 1;
  }
  .tabs p {
    margin: 0 1rem;
  }
  .tab:hover {
    cursor: pointer;
    background-color: #f8f8f8;
  }
  .active {
    background-color: #f8f8f8;
    border-bottom: 2px solid #f8f8f8;
  }
  .active:hover {
    background-color: #f4f4f4;
  }
  .intro {
    font-style: italic;
    font-size: 0.8rem;
    color: brown;
    text-align: center;
    margin: 0;
    margin-bottom: 1rem;
  }
  .message {
    margin-top: 1rem;
  }
  .bouton {
    display: flex;
    justify-content: center;
    margin: 3rem 0;
  }
  .controles {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .add {
    position: absolute;
    right: 0;
    bottom: 0;
  }
  .pres {
    text-align: center;
  }
  .height {
    min-height: calc(100% - 50px);
    padding-bottom: 100px;
  }
  ul {
    list-style-type: disc;
    list-style-position: inside;
  }
  li {
    padding: 0.5rem 1rem;
  }
  @media (max-width: 780px) {
    .wrapper {
      padding: 1rem 0.8rem;
    }
  }
  p {
    color: grey;
    text-align: center;
  }
</style>

<div class="tabs">
  {#each tabs[all ||subcategorie? 'sujets' : m.type] as tab}
    {#if all || subcategorie ||m.type!=="sondage"|| (m.type === 'sondage' && m.rank > 0) || (m.type === 'sondage' && m.rank === 0 && tab !== 'qcm')}
      <div
        class={`tab ${tab === $active ? 'active' : ''}`}
        on:click={() => {
          if (tab !== $active) {
            active.set(tab);
            trig.update(t => t + 1);
          } else active.set();
        }}>
        <p>
          {subcategorie ? tab : !all && m.type === 'sondage' && tab === 'qcm' ? 'reformulations' : tab}
        </p>
      </div>
    {/if}
  {/each}
</div>
{#if $active && current && current.refs}
  <div class="wrapper height">
    {#if !all}
      <p class="intro">
        {intro[subcategorie ? $active : !all ? (m.type === 'sondage' && $active === 'qcm' ? 'reformulations' : $active) : $active]}
      </p>
    {/if}
      <div class="controles">
        {#if current.refs.length > 1}
          <TriClassic />
          {#if !all && !subcategorie && m.locked === false}
            <div class="add">
              <Bouton name="Ecrire" type="light" action={add} />
            </div>
          {:else if !all && !subcategorie && m.locked === true}
            <div class="add">
              <Bouton name="Verrouillé" type="locked" />
            </div>
          {/if}
        {:else if !all && !subcategorie && m.locked === false}
          <Bouton name="Ecrire" type="light" action={add} />
        {:else if !all && !subcategorie && m.locked === true}
          <Bouton name="Verrouillé" type="locked" />
        {/if}
      </div>
      {#each current.refs as ref, i (ref)}
        {#if !all || (all && legarray[i])}
          {#if all && JSON.stringify(legarray[i]) !== JSON.stringify(legarray[i - 1])}
            <p style=" font-size:0.7rem; ">
              {`${legarray[i].cat} > ${legarray[i].sc}`}
            </p>
          {/if}
          {#if !id || ref !== id}
            <Sujet id={ref} hidetree={all || subcategorie ? false : true} />
          {/if}
        {/if}
      {/each}
      <div class="bouton">
        {#if current.areMoreSubjects}
          <Bouton name="Voir plus" type="light" {action} />
        {:else if current.refs && current.refs.length > 0}
          <p>Fin</p>
        {/if}
        {#if !current.areMoreSubjects && current.refs && current.refs.length === 0}
          <p in:fade>
            Pas encore de contenu ici.
          </p>
        {/if}
      </div>
  </div>
{:else}
  <div class="wrapper height pres">
    {#if all}
      <p>Tous les messages rangés par type, à trier à votre convenance...</p>
    {:else if subcategorie}
      <p>
        Les sujets sont des discussions arborescentes totalement libres
        pondérées graphiquement par les votes.
      </p>
      <p>
        Les sondages acceptent les remarques libres, mais seules les
        suites continues de questions/réponses sont représentées graphiquement.
      </p>
    {:else}
      {#if m.type === 'sondage'}
        <p>Ici vous pouvez voir</p>
        <ul>
          <li>les remarques libres</li>
          <li style="font-weight:bold;">les reformulations proposées</li>
        </ul>
        <p>de cette question.</p>
      {:else if ['remarque', 'critique', 'réponse'].includes(m.type)}
        <p>Ici vous pouvez voir</p>
        <ul>
          <li>les remarques libres</li>
          <li>les questions</li>
        </ul>
        <p>découlant de cette {m.type}.</p>
      {/if}
    {/if}

  </div>
{/if}
