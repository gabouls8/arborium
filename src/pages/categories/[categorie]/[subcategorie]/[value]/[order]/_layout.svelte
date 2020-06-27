<script>
  import { categories } from "./../../../../../../stores/categoriesStore.js";
  import { params } from "@sveltech/routify";
  import { goto } from "@sveltech/routify";

  let categorie, subcategorie, value, order;
  let prevsubcat, prevvalue, prevorder;
  const reset=''
  const sameAdress = () => {
    return (
      prevsubcat === $params.subcategorie &&
      prevvalue === $params.value &&
      prevorder === $params.order
    );
  };
  $: if (
    !sameAdress() &&
    $params.categorie &&
    $params.subcategorie &&
    $params 
  ) {
    prevsubcat = $params.subcategorie;
    prevvalue = $params.value;
    prevorder = $params.order;
    //console.log($params.subcategorie);
    if (
      ($params.categorie !== "all" || $params.subcategorie !== "all") &&
      !validate()
    ) {
      $goto("/crash");
    } else {
      categorie = $params.categorie;
      subcategorie = $params.subcategorie;
      value = $params.value;
      order = $params.order;
    }
  }
  const validate = () => {
    if ($categories[$params.categorie] === undefined) return false;
    if (
      $categories[$params.categorie].subcat[$params.subcategorie] === undefined
    )
      return false;
    return true;
  };
</script>

<style>
.main::-webkit-scrollbar {
  display: none;
}
</style>

<div class="main">
  <slot scoped={{ categorie, subcategorie, value, order,reset }} />
</div>
