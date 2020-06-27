<script>
  import { responseMaxSize } from "./scripts/textSizeLimitations.js";
  import { title, content, response } from "./../../stores/textStore.js";
  export let subcatId,index;

  if(!$response[subcatId][index])$response[subcatId][index]=''
  //$:console.log($response[subcatId])

</script>

<style>
input{
    width:100%;
    display: block;
}
</style>

<input
  type="text"
  bind:value={$response[subcatId][index]}
  placeholder="Réponse proposée"
  on:input={() => ($response[subcatId][index] = $response[subcatId][index].slice(0, responseMaxSize))} />
