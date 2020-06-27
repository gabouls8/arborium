<script>
  import { goto } from "@sveltech/routify";
  import Bouton from "./../_components/Boutons/bouton.svelte";
  import Legende from "./../tree/[subject]/_components/Legende.svelte";
  import { color } from "./../_components/scripts/color.js";
  import Degrade from "./../_components/Degrade.svelte";
</script>

<style>
  .main {
    padding: 2rem;
  }
  .pic-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 2rem;
  }
  .pic {
    display: flex;
    flex-direction: column;
    margin: 0;
    width: 48%;
    margin-bottom: 2rem;
  }
  img {
    box-sizing: border-box;
    width: 100%;
    margin: 0 auto;
  }
  .img {
    background-color: white;
    border: 2px solid green;
    border-radius: 20px;
    box-shadow: 3px 3px 10px #b3b3b3;
    margin-top: 5px;
  }
  .legende {
    margin: 0 auto;
    font-weight: bold;
  }
  h2 {
    text-align: center;
    margin-top: 3rem;
  }
  h4,
  h3 {
    text-align: center;
  }
  h2 {
    margin-bottom: 3rem;
  }
  .degrade {
    border: none;
    width: 100%;
    border-radius: 15px;
  }
  .degrade-wrapper {
    height: 30px;
    overflow: hidden;
  }
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .flex p {
    margin: 0.3rem 0;
  }
  span {
    font-weight: bold;
  }
  @media (max-width: 950px) {
    .main {
      padding: 0.8rem;
    }
    .pic-wrapper {
      flex-direction: column;
      width: 100%;
    }
    .pic {
      width: 100%;
    }
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
    margin: 0.5rem auto;
  }
  .flex-column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom:5rem;
  }
  .group p {
    margin-left: 1rem;
  }
  .flex-column p {
    text-align: center;
  }
  .tree-bouton{
    margin:0 auto;
  }
</style>

<div class="main">
  <h2>La visualisation graphique : deux modes pour un même arbre</h2>

  <h4>Couleur = taux d'approbation</h4>
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
  <div class="pic-wrapper">
    <div class="pic">
      <p class="legende">Filtre : OFF</p>
      <img class="img" src="appr.svg" alt="" />
      <p class="content">
        Fait ressortir les
        <span>idées les plus approuvées.</span>
      </p>
      <p class="content">
        Les branches épaisses sont celles qui ont le plus grand nombre de votes
        (positifs + négatifs)
      </p>
      <p class="content">
        Les branches
        <span>fines</span>
        à l'inverse sont : soit
        <span>les plus récentes</span>
        , soit celles qui n'ont pas eu beaucoup de considération
      </p>
      <p>
        Les nouvelles idées potentiellement novatrices et intéressantes sont
        donc les feuilles vertes avec des branches fines.
      </p>
    </div>
    <div class="pic">
      <p class="legende">Filtre : ON</p>
      <img class="img" src="chaine.svg" alt="" />

      <p class="content">
        Fait ressortir les successions d'idées ou remarques les plus approuvées.
        Valorise les
        <span>raisonnements dans leur ensemble</span>
        plutôt que les idées individuelles.
      </p>
      <p class="content">
        Les branches épaisses sont celles qui gardent un taux d'approbation
        élevé dans leur progression (
        <span>les raisonnements qui "se tiennent"</span>
        du début à la fin, ou les suites de remarques qui ont un
        <span>consensus général</span>
        .)
      </p>
    </div>
  </div>

  <h2>Ajustez la forme de l'arbre</h2>
  <div class="flex-column">
    <div class="group">
      <div class="bouton">
        <Bouton
          name="+ dispersés"
          type="light"
          img={'/feuilles-ecartees.svg'} />
      </div>
      <div class="bouton">
        <Bouton
          name="- dispersée"
          type="light"
          img={'/feuilles-rapprochees.svg'} />
      </div>
      <p class="subtitle">Écartez ou rapprochez</p>
    </div>
    <div class="group">
      <div class="bouton">
        <Bouton
          name="repulsion du sol +"
          type="light"
          img={'/ground-high.svg'} />
      </div>
      <div class="bouton">
        <Bouton name="repulsion sol -" type="light" img={'/ground-low.svg'} />
      </div>
      <p class="subtitle">Érigez ou affaissez</p>
    </div>
    <div class="group">
      <div class="bouton">
        <Bouton name="taille des feuilles +" type="light" img={'/big.svg'} />
      </div>
      <div class="bouton">
        <Bouton name="-" type="light" img={'/small.svg'} />
      </div>
      <p class="subtitle">Ajustez la taille</p>
    </div>
  </div>
  <h2>Et plus encore</h2>
  <div class="flex-column">
    <p>Tirer sur une branche</p>
    <p>Zoom</p>
    <p>Clic pour voir le contenu, les statistiques</p>
    <p>Clic pour voir la hiérarchie</p>
  </div>
  <h2>Testez :</h2>
  <div class="flex-column">
    <div class="tree-bouton">
      <Bouton
        img="/tree.svg"
        type="round big"
        action={() => $goto(`/tree/random`)} />
    </div>
    <p>(rechargez pour changer d'arbre)</p>
    <p>(Contenus factices et liens inactifs)</p>
    <p>(D'autres infos dans la légende)</p>
  </div>
  <h2>Bientôt</h2>
  <div class="flex-column">
    <p>Des exemples concrets</p>
    <p>Des sujets et sondages privés, seulement pour ceux à qui vous donnerez le lien...</p>
  </div>
</div>
