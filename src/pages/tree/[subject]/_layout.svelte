<script>
  import { messages } from "./../../../stores/messageStore.js";
  import randomTree from "./_components/scripts/random.js";
  import { tree, parametres } from "./../../../stores/treeStore.js";
  import unzipTree from "./_components/scripts/unzip.js";
  import { params } from "@sveltech/routify";
  import { db } from "./../../../_firebase.js";
  let seed;
  let parametre = {};

  $: promise = getTree($params);
  const getTree = async () => {
    if ($params.subject) {
      let data;
      if ($params.subject === "random") {
        data = randomTree();
      } else {
        console.log("get Tree");
        data = await db
          .collection("tree")
          .doc($params.subject)
          .get();
      }

      if ($params.subject === "random" || data.data()) {
        let treelight;
        if ($params.subject === "random") {
          treelight = data;
          for (let id of Object.keys(data)) {
            $messages[id] = {
              content:
                "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus laudantium quia rerum excepturi laboriosam nemo distinctio eveniet, unde molestias suscipit? Possimus nemo suscipit placeat voluptatum consequuntur illum provident omnis repudiandae. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus laudantium quia rerum excepturi laboriosam nemo distinctio eveniet, unde molestias suscipit? Possimus nemo suscipit placeat voluptatum consequuntur illum provident omnis repudiandae."
            };
          }
        } else {
          treelight = JSON.parse(data.data().tree);
          unzipTree(treelight);
        }
        console.log(treelight);
        parametre.maxDepth = 0;
        parametre.population = 0;
        for (let m of Object.keys(treelight)) {
          const node = treelight[m];
          if (node.children) {
            let index = [];
            node.children.forEach((k, i) => {
              if (k === undefined) index.push(i);
            });
            index.reverse();
            index.forEach(i => node.children.splice(i, 1));
          }
          if (!parametre.maxparticip) parametre.maxparticip = node.n;
          else parametre.maxparticip = Math.max(parametre.maxparticip, node.n);
          if (!parametre.minparticip) parametre.minparticip = node.n;
          else parametre.minparticip = Math.min(parametre.minparticip, node.n);
          parametre.maxDepth = Math.max(parametre.maxDepth, node.r);
          parametre.population++;
          if (node.r === 0) seed = node;
        }
        $parametres[$params.subject] = parametre;
        $tree[$params.subject] = seed;
        return "got it";
      } else {
        return null;
      }
    } else return null;
  };
</script>

<style>
  .middle {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
</style>

{#if $params.subject}
  {#await promise}
    <p>récupération de l'arbre...</p>
  {:then res}
    {#if res}
      {#if $params.subject && parametre && seed && parametre.population > 1}
        <slot scoped={{ subject: $params.subject, arbre: seed, parametre }} />
      {:else}
        <div class="middle">
          <p>Il n'y a pas encore de branches pour ce sujet.</p>
          <p>Il faut au moins une branche pour que l'arbre s'affiche.</p>
          <p>Les arbres et statistiques sont mis à jour toutes les 2 minutes</p>
        </div>
      {/if}
    {:else}
      <div class="middle">
        <p>Pas encore d'arbre à afficher..</p>
        <p>Les arbres et statistiques sont mis à jour toutes les 2 minutes</p>
      </div>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
{/if}
