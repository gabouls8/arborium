<script>
  import { messages } from "./../../../stores/messageStore.js";
  import { showModal } from "./../../../stores/layoutTriggers.js";
  import { subjects } from "./../../../stores/categoriesStore.js";
  import parseSort, { sortList } from "./../scripts/parseSort.js";
  import Bouton from "./../Boutons/bouton.svelte";
  import { params } from "@sveltech/routify";
  import { goto } from "@sveltech/routify";

  let tempSort = undefined;
  const selectType = sortType => {
    tempSort = { value: sortType };
  };
  const selectSort = (value, order) => {
    if ($params.value === value && $params.order === order) {
      showModal.set(false);
    } else {
      //on met un nouveau current sort, et ca devrait déclencher la collecte si la recherche n'a pas déja été faite
      $goto(`/message/${$params.message}/${value}/${order}`);
      showModal.set(false);
    }
  };
  const action = () => {
    if (!tempSort) {
      showModal.set(false);
    } else {
      tempSort = undefined;
    }
  };
</script>

<style>
  .content {
    display: block;
    justify-content: center;
    text-align: center;
  }
  h3 {
    margin: 0 0 10px 0;
  }
  .retour {
    margin-top: 1rem;
  }
</style>

<div class="content">
  <h3>Trier par :</h3>
  {#each sortList as sortType}
    {#if !tempSort}
      <div>
        <Bouton
          name={parseSort(sortType)}
          type="standard sortBy"
          action={() => selectType(sortType)} />
      </div>
    {:else if sortType === tempSort.value}
      {#each ['desc', 'asc'] as order}
        <div>
          <Bouton
            name={parseSort(sortType, order)}
            type="standard sortBy"
            action={() => selectSort(sortType, order)} />
        </div>
      {/each}
    {/if}
  {/each}
  <div class="retour">
    <Bouton name="Retour" type="light" {action} />
  </div>
</div>
