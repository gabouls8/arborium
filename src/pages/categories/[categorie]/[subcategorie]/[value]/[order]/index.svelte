<script>
	import Message from './../../../../../_components/Message.svelte';
  import Sujet from "./_components/Sujet.svelte";
  import { tabs } from "./../../../../../_components/scripts/parseSort.js";
  import { sortClassic } from "./../../../../../../stores/classicStore.js";
  import Tabs from "./../../../../../_components/Tabs.svelte";
  import NewMessageForm from "./../../../../../_components/Modal/newMessageForm.svelte";
  import {
    showModal,
    reload,
    dev
  } from "./../../../../../../stores/layoutTriggers.js";
  import NeedAccount from "./../../../../../_components/Modal/NeedAccount.svelte";
  import { user } from "./../../../../../../stores/user.js";
  import Degrade from "./../../../../../_components/Degrade.svelte";
  import { messages, type } from "./../../../../../../stores/messageStore.js";
  import { paginationNumber } from "./../../../../../_components/scripts/pagination.js";
  import { fade } from "svelte/transition";
  import Bouton from "./../../../../../_components/Boutons/bouton.svelte";
  import { db } from "./../../../../../../_firebase.js";
  import {
    categories,
    subjects
  } from "./../../../../../../stores/categoriesStore.js";
  import { params, goto } from "@sveltech/routify";
  export let scoped;
  

  const initTabs = key => {
    tabs[key].forEach(t => {
      if (!$sortClassic[t]) $sortClassic[t] = { value: "date", order: "desc" };
    });
  };

  $: categorie = scoped.categorie;
  $: subcategorie = scoped.subcategorie;
  $: if (subcategorie) initTabs("sujets");
  //$: if (subcategorie && subcategorie !== "all") initTabs("sujets");

  const all = (c, s) => {
    return c === "all" && s === "all";
  };

  const newSub = () => {
    if ($user) {
      type.set("remarque");
      showModal.set(NewMessageForm);
    } else {
      showModal.set(NeedAccount);
    }
  };
  const newSond = () => {
    if ($user) {
      type.set("sondage");
      showModal.set(NewMessageForm);
    } else {
      showModal.set(NeedAccount);
    }
  };
</script>

<style>
  .main {
    padding: 2rem;
  }
  @media (max-width: 780px) {
    .main {
      padding: 0.8rem;
    }
  }
  p {
    color: grey;
    text-align: center;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  h1 {
    font-size: 1.8rem;
    margin: 0;
  }
  .desc {
    text-align: left;
    font-size: 0.8rem;
    margin: 0.5em 0;
    color: grey;
  }
  .group {
    display: flex;
    align-items: center;
  }
  .group p {
    margin: 0;
  }
  .space {
    margin: 0 5px;
  }
</style>

{#if all(categorie, subcategorie)}
  <div class="main">
    <div class="header">
      <h1>Tous les arbres</h1>
    </div>
    <p class="desc">
      Triés par type, sans distinction de catégorie ou de section..
    </p>
  </div>
  <Degrade />
{:else}
  <div class="main">
    <div class="header">
      <h1>
        {$categories[categorie].name} > {$categories[categorie].subcat[subcategorie].name}
      </h1>
      {#if !$categories[categorie].subcat[subcategorie].locked||$dev}
        <div class="group">
          <p>Lancer un:</p>
          <div class="space">
            <Bouton name="Sondage" type="light" action={newSond} />
          </div>
          <Bouton name="Sujet" type="light" action={newSub} />
        </div>
      {:else}
        <Bouton name="Verrouillé" type="locked" />
      {/if}
    </div>
    <p class="desc">
      {$categories[categorie].subcat[subcategorie].description}
    </p>
  </div>
  <Degrade />
{/if}
{#if all(categorie, subcategorie)}
  <Tabs all={true} />
{:else}
  <Tabs {subcategorie} />
{/if}
