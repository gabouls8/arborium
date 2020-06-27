<script>
  import SortType from "./../../../../../../_components/Modal/SortType.svelte";
  import { subjects } from "./../../../../../../../stores/categoriesStore.js";
  import parseSort from "./../../../../../../_components/scripts/parseSort.js";
  import { showModal } from "./../../../../../../../stores/layoutTriggers.js";
  import Bouton from "./../../../../../../_components/Boutons/bouton.svelte";
  import { params } from "@sveltech/routify";

  const action = () => {
    showModal.set(SortType);
  };
</script>

<style>
  .content {
    margin-top: 5px;
    display: flex;
    justify-content: center;
  }
</style>

<div class="content">
    <Bouton
      name="Tri : {parseSort($params.value, $params.order)}"
      type="light"
      {action} />
</div>
