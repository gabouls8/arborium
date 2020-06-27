<script>
  import { goto } from "@sveltech/routify";
  import { categories } from "./../../stores/categoriesStore.js";
  import AuthLinks from "./AuthLinks.svelte";
  import ListCategories from "./ListCategories.svelte";
  import { showSidebar } from "./../../stores/layoutTriggers.js";

  const action = (url) => {
    if (window.innerWidth <= 780) showSidebar.set(false);
    $goto(url);
  };
</script>

<style>
  .sidebar {
    padding-top: 0;
    color:#2C0F07;
  }
  .category {
    padding: 1rem;
    cursor: pointer;
    transition-property: padding;
    transition-duration: 0.3s;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 500
  }
  .all{
        border-bottom: none;
    border-top: 1px solid #e0e0e0;

  }
  .category:hover {
    padding-left: 1.2em;
  }
  .onlys{
    font-weight: 500;
  }
</style>

{#if $categories}
  <div class="sidebar">
    <ul>
      <div class="onlys">
        <AuthLinks />
      </div>
      <li class="category" on:click={()=>action('/')}>Accueil</li>
      <li class="category" on:click={()=>action('/presentation')}>Mode d'emploi</li>
      {#each Object.keys($categories).sort((a, b) => {
        if ($categories[a].name < $categories[b].name) return -1;
        if ($categories[a].name > $categories[b].name) return 1;
        return 0;
      }) as category}
        <ListCategories {category} />
      {/each}
      <li class="category all" on:click={()=>action('/categories/all/all/date/desc')}>Tous les arbres</li>
    </ul>
  </div>
{/if}
