<script>
	import { showSidebar } from './../../stores/layoutTriggers.js';
  import { categories, openedTabs } from "./../../stores/categoriesStore.js";
  import { fade } from "svelte/transition";
  import { slide } from "svelte/transition";
  import { goto } from "@sveltech/routify";

  export let category;

  const openTab = () => {
    openedTabs.update(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return prev.concat(category);
    });
  };

  const action = subCat => {
  if(window.innerWidth<=780) showSidebar.set(false)
  
    $goto(`/categories/${category}/${subCat}/date/desc`);
  };
</script>

<style>
  .category {
    padding: 1rem;
    font-weight:500;
  }
  .subCategory {
    padding: 1rem;
    background-color: white;
    font-style: italic;
    padding-left:2rem;
  }
  .clickable,.sc-clickable {
    cursor: pointer;
    transition-property: padding;
    transition-duration: 0.3s;
  }
  .clickable:hover {
    padding-left: 1.2em;
  }

  img{
    height:0.8rem;
  }
</style>

<li class="category clickable" on:click={() => openTab($categories[category].id)} in:fade="{{  duration: 50 }}">
      <img src="/chevron.svg" alt="">

  {$categories[category].name}
</li>
{#if $openedTabs.includes(category) && Object.keys($categories[category].subcat).length>0}
  {#each Object.keys($categories[category].subcat).sort((a, b) => {
              if ($categories[category].subcat[a].name < $categories[category].subcat[b].name) return -1;
              if ($categories[category].subcat[a].name > $categories[category].subcat[b].name) return 1;
              return 0;
            }) as subcat}
    <div
      transition:slide="{{ duration: 100 }}"
      class="subCategory sc-clickable"
      on:click={() => action(subcat)}>
      {$categories[category].subcat[subcat].name}
    </div>
  {/each}
{/if}
