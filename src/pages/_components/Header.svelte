<script>
  import { user } from "./../../stores/user.js";
  import { showSidebar, gotCategories,dev } from "./../../stores/layoutTriggers.js";
  import { gotUser } from "./../../stores/user.js";
  import AuthLinks from "./AuthLinks.svelte";
  import { url } from "@sveltech/routify";

  const shoSidebar = () => {
    if (window.innerWidth > 780) {
      showSidebar.set(true);
    }
  };
</script>

<style>
  .header {
    height: 64px;
    background-color: green;
    position: absolute;
    width: 100%;
    color: white;
  }
  .arborium-logo {
    height: 50px;
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .spread {
    width: 80%;
    justify-content: space-between;
    margin: 0 auto;
  }

  .title {
    font-size: 2rem;
    color: white;
    padding-left: 15px;
  }
  @media (max-width: 780px) {
    .spread {
      justify-content: space-evenly;
    }
  }
  a:hover {
    text-decoration: none;
  }
  .menu {
    height: 30px;
  }
  .onlys {
    position: absolute;
    left: 30px;
    padding: 15px 30px;
  }
  ul {
    list-style-type: none;
  }
</style>

<header class="header flex">
  <div class="onlys" use:shoSidebar>
    <img
      class="menu"
      src="/menu.svg"
      alt=""
      on:touchstart|stopPropagation|preventDefault={() => showSidebar.update(bool => !bool)}
      on:click={() => showSidebar.update(bool => !bool)} />
  </div>

  <div class="flex spread">
    <div class="flex">
      <img
        class="arborium-logo hides"
        src="/tree_big.svg"
        alt="arborium-logo" />
      <a class="title" href={$url('/')}>Arborium {$dev?"...":""}</a>
    </div>
    <div class="hides">
      <ul class="flex">
        <AuthLinks />
      </ul>
    </div>

  </div>
</header>
