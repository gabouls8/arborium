<script>
  import { color } from "./_components/scripts/color.js";
  import Bouton from "./_components/Boutons/bouton.svelte";
  import { goto, url } from "@sveltech/routify";

  let filtre = false;
</script>

<style>
  h2 {
    text-align: center;
    margin: 2rem;
  }
  h5 {
    text-align: center;
  }
  p {
    line-height: 1rem;
    text-align: center;
  }
  .pic {
    margin: 5px auto;
    width: 80%;
    background-color: white;
    border: 2px solid green;
    border-radius: 20px;
  }
  .pic-odd {
    box-shadow: 3px 3px 10px rgb(133, 133, 133);
    filter: drop-shadow();
  }
  .pic-even {
    box-shadow: 3px 3px 10px rgb(133, 133, 133);
    filter: drop-shadow();
  }
  .pic-degrade {
    border: 2px solid #411f15;
    box-shadow: 3px 3px 10px #411f15;
    filter: drop-shadow();
  }
  .tree {
    width: 100%;
  }
  .bloc {
    width: 100%;
    padding: 15%;
    box-sizing: border-box;
  }
  .bloc:nth-child(odd) {
    --odd-bg: #6a382c;
    background: white;
    color: var(--odd-bg);
  }

  .bloc:nth-child(even) {
    --even-bg: #ece9e8;
    background: var(--even-bg);
    color: #5c3127;
  }
  .tree-button {
    display: flex;
    justify-content: center;
  }
  .degrade {
    border: none;
    width: 100%;
    border-radius: 20px;
  }
  .degrade-wrapper {
    height: 30px;
    overflow: hidden;
  }
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .firstpic {
    width: 40%;
  }
</style>

<div class="bloc">
  <h2>Arborium est un forum en forme d'arbre...</h2>
  <div class="pic firstpic">
    <img src="/maintree.svg" alt="" />
  </div>
</div>

<div class="bloc">
  <h2>...qui permet de se concerter...</h2>
</div>

<div class="bloc">
  <h2>..et/ou prendre des décisions ensemble</h2>
</div>

<div class="bloc">
  <h2>Ici l'anarchie n'est pas un problème...</h2>
  <div class="pic pic-even">
    <img class="tree" src="appr.svg" alt="" />
  </div>
</div>

<div class="bloc">
  <h2>...car seul ce qui est le plus unanime ressort:</h2>
  <div class="pic pic-odd">
    <img class="tree" src="chaine.svg" alt="" />
  </div>
</div>

<div class="bloc">
  <h2>D'un seul clic :</h2>
  {#if filtre}
    <div class="tree-button">
      <Bouton
        name={`filtre: ON`}
        type="light"
        action={() => (filtre = false)} />
    </div>
    <div class="pic pic-even">
      <img class="tree" src="chaine.svg" alt="" />
    </div>
    <p>Les suites de remarques (ou autres) qui restent unanimes</p>
  {/if}
  {#if !filtre}
    <div class="tree-button">
      <Bouton
        name={`filtre: OFF`}
        type="light"
        action={() => (filtre = true)} />
    </div>
    <div class="pic pic-even">
      <img class="tree" src="appr.svg" alt="" />
    </div>
    <p>Des remarques dans tous les sens</p>
  {/if}
</div>

<div class="bloc">
  <h2>Pour voir les ressentis partagés..</h2>
</div>

<div class="bloc">
  <h2>...et pour plus de satisfaction suite aux décisions prises</h2>
</div>

<div class="bloc tree-button">
  <img src="/tree.svg" alt="" style="margin:0 auto; height:50px;" />
</div>

<div class="bloc">
  <h2>Pas de maître de débat</h2>
</div>

<div class="bloc">
  <h2>Facile de s'intégrer en cours de route</h2>
</div>

<div class="bloc">
  <h2>Des sondages pour ceux qui n'ont pas le temps</h2>
</div>

<div class="bloc">
  <h2>Des sujets libres</h2>
</div>

<div class="bloc">
  <h2>Une échelle de couleurs</h2>
  <div class="pic pic-degrade" style="padding:5%;">
    <div class="degrade-wrapper">
      <img class="degrade" src="/degrade.svg" alt="dégradé" />
    </div>
    <div class="flex">
      <p style="width:50px; text-align:left; margin:2px 0;">0%</p>
      <p style="width:50px; text-align:center; margin:2px 0;">25%</p>
      <p style="width:50px; text-align:center; margin:2px 0;">50%</p>
      <p style="width:50px; text-align:center; margin:2px 0;">75%</p>
      <p style="width:50px; text-align:right; margin:2px 0;">100%</p>
    </div>
    <div class="flex">
      {#each [0, 2.5, 5, 7.5, 10] as n}
        <svg height="50" width="50">
          <circle cx="25" cy="25" r={(25 * n) / 10} fill={color(n / 10)} />
        </svg>
      {/each}
    </div>
    <p>(le taux d'approbation)</p>
  </div>
</div>

<div class="bloc">
  <h2>Pousse à trouver les points unanimes, et bâtir dessus</h2>
</div>

<div class="bloc">
  <h2>Anonyme</h2>
</div>

<div class="bloc tree-button">
  <img src="/tree.svg" alt="" style="margin:0 auto; height:50px;" />
</div>

<div class="bloc">
  <h2>Exemples :</h2>
  <p>à faire</p>
</div>

<div class="bloc">
  <h2>Testez avec un arbre randomisé</h2>
  <div class="tree-button">
    <Bouton
      img="/tree.svg"
      type="round big"
      action={() => $goto(`/tree/random`)} />
  </div>
  <p>(Un nouvel arbre à chaque rechargement)</p>
  <p>(Contenus factices et liens inactifs)</p>
</div>

<div class="bloc">
  <h5>Pas de copyright</h5>
  <p>Arborium est une expérience, chacun est libre de s'en inspirer ou non.</p>
  <p>Arborium est à but non-lucratif.</p>
  <p>
    Arborium souhaite simplement innover en matière de gestion des prises de
    décisions collectives.
  </p>
</div>
