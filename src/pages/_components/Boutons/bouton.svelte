<script>
  export let action;
  export let type;
  export let name;
  export let img;
</script>

<style>
  .standard {
    margin: 0;
    border: none;
    background-color: green;
    color: white;
    font-size: bold;
  }
  .answer {
    min-width: 40px;
  }
  .answered {
    background-color: #18bd00;
  }
  .round {
    border-radius: 1rem;
  }
  .light {
    border: green;
    color: green;
    font-weight: 500;
    margin: 0;
  }
  .sortBy {
    width: 100%;
    margin: 2px;
  }
  button {
    box-shadow: 1px 1px 5px #b3b3b3;
    border-radius: 6px;
  }
  button:hover {
    cursor: pointer;
  }
  img {
    height: 25px;
  }
  .locked {
    border: rgb(230, 100, 35);
    color: rgb(230, 100, 35);
    font-weight: 500;
    margin: 0;
  }
  .locked:hover {
    cursor: default;
  }
  .slim {
    border: none;
    box-shadow: none;
    background-color: white;
    color: green;
    font-weight: 400;
    margin: 0;
    text-decoration: underline;
  }
  .big img {
    height: 50px;
  }
  .grey {
    color: grey;
    font-size: 0.7rem;
  }
  .white {
    color: white;
    background-color: green;
  }
</style>

{#if img}
  <button on:click={action} class={type}>
    <img src={img} alt={name} />
  </button>
{:else}
  <button on:click={action} class={type}>{name}</button>
{/if}
