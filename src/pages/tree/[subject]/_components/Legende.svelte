<script>
  import { color } from "./../../../_components/scripts/color.js";
  import { showModal } from "./../../../../stores/layoutTriggers.js";
  import Bouton from "./../../../_components/Boutons/bouton.svelte";
</script>

<style>
  img {
    width: 100%;
  }
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .bouton {
    margin: auto 2px;
    width: auto;
    /* display: inline-block; */
  }
  .group {
    width: auto;
    margin: 0 5px;
    display: inline-flex;
  }
  .subtitle {
    padding-left: 1rem;
  }
  .middle {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }
  .small {
    width: 30px;
    padding: 5px;
    margin-right: 1rem;
    box-shadow: 1px 1px 5px #b3b3b3;
  }
  .degrade{
    border-radius: 20px;
  }
</style>

<div class="middle">
  <Bouton name="Fermer" type={'light'} action={() => showModal.set(false)} />
</div>

<p>
  Les branches découlant de feuilles qui ont plus de 70% d'opposition
  n'apparaissent pas dans l'arbre.
</p>

<h1>Couleur et taille des feuilles</h1>
<p>Représente le pourcentage d'approbation :</p>
<img class="degrade" src="/degrade.svg" alt="dégradé" />
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
<p>(sauf les réponses aux qcm, qui ont toutes la même taille que leur question)</p>


<h1>Largeur des branches</h1>

<div class="group">
  <div class="bouton">
    <Bouton name={`filtre : OFF`} type="light" />
  </div>
</div>
<p>Représente le nombre total de votes :</p>
<div class="group">
  <div class="bouton">
    <img
      class="small"
      src="/nouvelle-bonne-idee.svg"
      alt="branche fine verte" />
  </div>
  <p>Une bonne idée novatrice (encore peu de votes mais approuvée)</p>
</div>
<div class="group">
  <div class="bouton">
    <img
      class="small"
      src="/ancienne-bonne-idee.svg"
      alt="branche large verte" />
  </div>
  <p>Une bonne idée déja bien établie (approuvée + beaucoup de votes)</p>
</div>
<div>
  <h4 style="text-align:center; ">Un exemple : des idées nouvelles et plus anciennes</h4>
  <img src="/mode-idee.svg" alt="aperçu" />
</div>
<div class="group">
  <div class="bouton">
    <Bouton name={`filtre : ON`} type="light" />
  </div>
</div>
<p>
  La largeur de branche n'a pas de signification autre que l'approbation
  générale du raisonnement à cette section de la branche.
</p>

<h1>Longueur des branches</h1>

<p>
  ... s'adapte pour chaque branche en fonction des besoins de répartition
  d'espace, en faisant ressortir les feuilles avec fort taux d'approbation.
</p>

<h1>Actions au toucher ou à la souris</h1>
<h3>Sur un élément</h3>
<p>Cliquer pour afficher</p>
<p>
  Cliquer + tirer pour déplacer un élément manuellement (Relance le mouvement.
  Pour arreter: bouton STOP, ou clic n'importe où).
</p>
<h3>Partout ailleurs</h3>
<p>Zoomer - Dézoomer - Cliquer-déplacer</p>

<h1>Boutons</h1>
<Bouton name="START" type="light" />
<p>Relance le mouvement</p>
<Bouton name="STOP" type="light" />
<p>
  Arrête le mouvement (un clic n'importe où entre les branches a le même effet).
</p>
<div class="group">
  <div class="bouton">
    <Bouton name="+ dispersés" type="light" img={'/feuilles-ecartees.svg'} />
  </div>
  <div class="bouton">
    <Bouton name="- dispersée" type="light" img={'/feuilles-rapprochees.svg'} />
  </div>
  <h3 class="subtitle">Séparation des éléments</h3>
</div>
<p>
  Augmente ou diminue le besoin d'espace de chaque élément (et de chaque groupe
  d'élément).
</p>

<div class="group">
  <div class="bouton">
    <Bouton name="repulsion du sol +" type="light" img={'/ground-high.svg'} />
  </div>
  <div class="bouton">
    <Bouton name="repulsion sol -" type="light" img={'/ground-low.svg'} />
  </div>
  <h3 class="subtitle">Besoin d'écartement du sol</h3>
</div>
<p>
  Influence surtout les branches les plus proches du sol. Un arbre en V plutot
  qu'en éventail aurait besoin de quelques clics sur le bouton de droite.
</p>

<div class="group">
  <div class="bouton">
    <Bouton name="taille des feuilles +" type="light" img={'/big.svg'} />
  </div>
  <div class="bouton">
    <Bouton name="-" type="light" img={'/small.svg'} />
  </div>
  <h3 class="subtitle">Taille des branches et des feuilles</h3>

</div>
<p>
  Augmente ou diminue simultanément la taille des branches et des feuilles. Ces
  boutons ne relancent pas le mouvement.
</p>

<div class="group">
  <div class="bouton">
    <Bouton
      name="repulsion base du tronc +"
      type="light"
      img={'/tronc-fort.svg'} />
  </div>
  <div class="bouton">
    <Bouton
      name="repulsion base du tronc -"
      type="light"
      img={'/tronc-faible.svg'} />
  </div>
  <h3 class="subtitle">Besoin de progression vers l'extérieur</h3>
</div>
<p>
  Bouton de gauche, les branches voudront plutot s'éloigner de la base du tronc
  (vers l'éxtérieur et vers le haut).
</p>
<p>
  Bouton de droite, on peut autoriser certaines branches à revenir vers
  l'intérieur.
</p>

<div class="group">
  <div class="bouton">
    <Bouton name="pesanteur +" type="light" img={'/gravity-high.svg'} />
  </div>
  <div class="bouton">
    <Bouton name="pesanteur -" type="light" img={'/gravity-low.svg'} />
  </div>
  <h3 class="subtitle">Gravité</h3>
</div>
<p>
  Augmente ou diminue la gravité. La gravité initiale est quasi-nulle. Nécéssite
  plusieurs clics. Peu utile en règle générale.
</p>

<div class="middle">
  <Bouton name="Fermer" type={'light'} action={() => showModal.set(false)} />
</div>
