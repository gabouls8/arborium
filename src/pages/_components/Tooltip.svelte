<script>
	import { counter } from './scripts/parseSort.js';
  import { color,colorr } from "./scripts/color.js";
  export let m, node, grey,question;

  
</script>

<style>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 220px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    top: -5px;
    left: 15px;
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent black transparent transparent;
  }
  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
  span {
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 500;
  }
</style>

<div class="tooltip">
  <svg height="10" width="10">
    <circle cx="5" cy="5" r="5" fill={grey ? 'grey' : colorr({m,node,question})} />
  </svg>
  <span class="tooltiptext">
  {counter({m,node,question})}
    <!-- {#if m}
      {`${m.life + m.block} vote${m.life + m.block > 1 ? 's' : ''} - ${m.block === 0 ? 100 : Math.floor((100 * m.life) / (m.block + m.life))}%positifs`}
    {:else}
      {`${node.data.n} vote${node.data.n > 1 ? 's' : ''} - ${Math.floor(node.data.a)}%positifs`}
    {/if} -->
  </span>
</div>
