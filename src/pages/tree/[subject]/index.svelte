<script>
  import TreeMessageList from "./_components/TreeMessageList.svelte";
  import Legende from "./_components/Legende.svelte";
  import { showModal } from "./../../../stores/layoutTriggers.js";
  import Bouton from "./../../_components/Boutons/bouton.svelte";
  import { color } from "./../../_components/scripts/color.js";
  import {
    tree,
    parametres,
    currentMessage
  } from "./../../../stores/treeStore.js";
  import { subjects } from "./../../../stores/categoriesStore.js";
  import {
    selectionne,
    dragended,
    dragged,
    dragstarted
  } from "./_components/scripts/handlers.js";
  import { onMount } from "svelte";
  import { tick } from "svelte";
  import groundPush from "./_components/scripts/forceGroundPush";
  import gravity from "./_components/scripts/forceGravity";
  import repulse from "./_components/scripts/forceRepulse";
  import forceZoom from "./_components/scripts/forceZoom";
  import {
    select,
    mouse,
    drag,
    hierarchy,
    zoom,
    event,
    piecewise,
    interpolateHsl,
    forceSimulation,
    forceCollide,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
    zoomIdentity
  } from "d3";
  import preprocess from "./_components/scripts/preProcess";

  export let scoped;

  let simulation;
  let charge = -1000;
  let gravite = 0.1;
  let repousse = 1;
  let sol = 0.3;
  let svg;
  let mode = "OFF";
  let controles = false;
  let plus = false;
  let dragging = { drag: false };

  const graph = svg => {
    if (!scoped.arbre || !scoped.parametre) {
      setTimeout(() => {
        alert("Si vous n'avez pas d'arbre, essayez de recharger la page");
      }, 100);
    }
    let arbre = scoped.arbre;
    let parametre = scoped.parametre;

    let root = hierarchy(arbre);
    console.log(root)

    let height = document.querySelector("#main").offsetHeight;
    let width = document.querySelector("#main").offsetWidth;

    const { links, nodes, rayonStd } = preprocess(
      Math.min(width, height),
      root,
      arbre,
      parametre
    );

    svg.attr("viewBox", [-width / 2, (-9 * height) / 10, width, height]);
    let g = svg.append("g");

    g.append("line")
      .attr("x1", -10000)
      .attr("y1", 0)
      .attr("x2", 10000)
      .attr("y2", 0)
      .style("stroke", "#000")
      .style("stroke-width", 2)
      .attr("class", "groundLine");

    simulation = forceSimulation(nodes)
      .alpha(1)
      .force("collide", forceCollide(d => d.rayonCollide))
      .force(
        "link",
        forceLink(links)
          .id(d => d.id)
          .distance(d => d.target.desiredLength)
          .strength(1)
      )
      .force("charge", forceManyBody().strength(charge))
      .force("groundPush", groundPush().strength(sol))
      .force("gravity", gravity().strength(gravite))
      .force("repulse", repulse().strength(repousse));

    const clicked = nodes => {
      return () => {
        simulation.stop();
        controles = false;
      };
    };
    const zoomed = () => {
      select("g").attr("transform", event.transform);
    };

    svg
      .call(
        zoom()
          .extent([[0, 0], [600, 600]])
          .scaleExtent([0.1, 5000])
          .clickDistance(10)
          .on("zoom", zoomed)
      )
      .on("click", clicked(nodes));

    const link = g
      .append("g")
      .attr("stroke", "rgb(131, 59, 0)")
      .selectAll("line")
      .data(links)
      .join("line")
      .style("stroke-width", d => d.target.width)
      .attr("stroke-opacity", 0.6)
      .attr("class", "branch");

    const tooltip = select(".relative")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("z-index", "10");

    const node = g
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", ({ data }) => color(data.a / 100))
      .attr("r", d => d.rayon)
      .on("mouseover", function(d) {
        return tooltip
          .style("visibility", "visible")
          .style("top", (event.offsetY + 10).toString() + "px")
          .style("left", (event.offsetX + 10).toString() + "px")
          .html(d.tooltip);
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      })
      .call(
        drag()
          .clickDistance(10)
          .on("start", dragstarted(simulation))
          .on("drag", dragged(simulation, dragging, tooltip))
          .on("end", dragended(simulation, dragging))
      )
      .on("mouseup", () => console.log("mouseup"))
      .on("click", (d, i, n) => {
        simulation.stop();
        tooltip.style("visibility", "hidden");
        selectionne(d, i, n);
        console.log(d);
        currentMessage.set(d);
        showModal.set(TreeMessageList);
      });

    let halfWidth = width / 2;
    let aboveGndHeight = (9 * height) / 10;

    simulation.on("tick", () => {
      let maxWidth, maxHeight;
      if (!dragging.drag) {
        node.each(n => {
          if (!maxWidth) maxWidth = Math.abs(n.x) + rayonStd;
          else if (Math.abs(n.x) + rayonStd > maxWidth)
            maxWidth = Math.abs(n.x) + rayonStd;
          if (!maxHeight) maxHeight = Math.abs(n.y) + rayonStd;
          else if (Math.abs(n.y) + rayonStd > maxHeight)
            maxHeight = Math.abs(n.y) + rayonStd;
        });
        halfWidth = 1.1 * maxWidth;
        aboveGndHeight = 1.1 * maxHeight;

        svg.attr("viewBox", [
          -halfWidth,
          -aboveGndHeight,
          2 * halfWidth,
          (aboveGndHeight / 9) * 10
        ]);
      }
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    });
    // setTimeout(() => {
    //   simulation.stop();
    // }, 6000);
  };

  const chargeAction = type => {
    return () => {
      charge = type === "plus" ? 1.2 * charge : 0.8 * charge;
      console.log("charge : ", charge);
      const force = simulation.force("charge");
      force.strength(charge);
      simulation.alphaTarget(1).restart();
      simulation.alphaTarget(0.2);
    };
  };
  const solAction = type => {
    return () => {
      sol = type === "plus" ? 1.2 * sol : 0.8 * sol;
      console.log("sol : ", sol);
      const force = simulation.force("groundPush");
      force.strength(sol);
      simulation.alphaTarget(1).restart();
      simulation.alphaTarget(0.2);
    };
  };
  const graviteAction = type => {
    return () => {
      gravite = type === "plus" ? 1.2 * gravite : 0.8 * gravite;
      console.log("gravite : ", gravite);
      const force = simulation.force("gravity");
      force.strength(gravite);
      simulation.alphaTarget(1).restart();
      simulation.alphaTarget(0.2);
    };
  };
  const repousseAction = type => {
    return () => {
      repousse = type === "plus" ? 1.2 * repousse : 0.8 * repousse;
      console.log("repulse : ", repousse);
      const force = simulation.force("repulse");
      force.strength(repousse);
      simulation.alphaTarget(1).restart();
      simulation.alphaTarget(0.2);
    };
  };
  const tailleFeuilles = type => {
    return () => {
      select(svg)
        .selectAll("circle")
        .attr("r", d => {
          if (mode === "OFF") {
            d.width = type === "plus" ? 1.2 * d.width : 0.8 * d.width;
            return (d.rayon = type === "plus" ? 1.2 * d.rayon : 0.8 * d.rayon);
          } else if (mode === "ON") {
            d.widthLimited =
              type === "plus" ? 1.2 * d.widthLimited : 0.8 * d.widthLimited;
            d.rayonLimited =
              type === "plus" ? 1.2 * d.rayonLimited : 0.8 * d.rayonLimited;
            return d.rayonLimited;
          }
        });
      select(svg)
        .selectAll(".branch")
        .style("stroke-width", d => {
          if (mode === "OFF") return d.target.width;
          else if (mode === "ON") return d.target.widthLimited;
        });
    };
  };
  const approbation = () => {
    select(svg)
      .selectAll("circle")
      .attr("r", d => d.rayon);
    select(svg)
      .selectAll(".branch")
      .style("stroke-width", d => d.target.width);
  };
  const chaines = () => {
    select(svg)
      .selectAll("circle")
      .attr("r", d => d.rayonLimited);
    select(svg)
      .selectAll(".branch")
      .style("stroke-width", d => d.target.widthLimited);
  };
  const toogleMode = () => {
    if (mode === "OFF") {
      mode = "ON";
      chaines();
    } else if (mode === "ON") {
      mode = "OFF";
      approbation();
    }
  };
  $: if (scoped.arbre && scoped.parametre && svg) {
    const svg = select("svg");
    graph(svg);
  }
</script>

<style>
  svg {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 5px solid yellow;
  }
  div {
    width: 100%;
    height: 100%;
  }
  .relative {
    position: relative;
  }
  .controle {
    position: absolute;
    height: 50px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }
  .bouton {
    margin: auto 2px;
    width: auto;
  }
  .group {
    width: auto;
    margin: 0 5px;
    display: inline-flex;
  }
</style>

<div class="relative">
  <div class="controle">
    {#if !controles}
      <div class="bouton">
        <Bouton
          name="Répartir les branches"
          type="light"
          action={() => (controles = true)} />
      </div>
      <div class="group">
        <div class="bouton">
          <Bouton
            name="légende"
            type="light"
            action={() => showModal.set(Legende)} />
        </div>
      </div>
      <div class="group">
        <div class="bouton">
          <Bouton name={`filtre: ${mode}`} type="light" action={toogleMode} />
        </div>
      </div>
    {:else}
      <div class="group">
        <div class="bouton">
          <Bouton
            name="Cacher"
            type="light"
            action={() => (controles = false)} />
        </div>
      </div>

      <div class="group">
        <div class="bouton">
          <Bouton
            name="+ dispersés"
            type="light"
            action={chargeAction('plus')}
            img={'/feuilles-ecartees.svg'} />
        </div>
        <div class="bouton">
          <Bouton
            name="- dispersée"
            type="light"
            action={chargeAction('moins')}
            img={'/feuilles-rapprochees.svg'} />
        </div>
      </div>

      <div class="group">
        <div class="bouton">
          <Bouton
            name="repulsion du sol +"
            type="light"
            action={solAction('plus')}
            img={'/ground-high.svg'} />
        </div>
        <div class="bouton">
          <Bouton
            name="repulsion sol -"
            type="light"
            action={solAction('moins')}
            img={'/ground-low.svg'} />
        </div>
      </div>
      <div class="group">
        <div class="bouton">
          <Bouton
            name="taille des feuilles +"
            type="light"
            action={tailleFeuilles('plus')}
            img={'/big.svg'} />
        </div>
        <div class="bouton">
          <Bouton
            name="-"
            type="light"
            action={tailleFeuilles('moins')}
            img={'/small.svg'} />
        </div>
      </div>
      {#if !plus}
        <div class="group">
          <div class="bouton">
            <Bouton name="Plus" type="light" action={() => (plus = true)} />
          </div>
        </div>
      {:else}
        <div class="group">
          <div class="bouton">
            <Bouton name="Moins" type="light" action={() => (plus = false)} />
          </div>
        </div>
        <div class="group">
          <div class="bouton">
            <Bouton
              name="repulsion base du tronc +"
              type="light"
              action={repousseAction('plus')}
              img={'/tronc-fort.svg'} />
          </div>
          <div class="bouton">
            <Bouton
              name="repulsion base du tronc -"
              type="light"
              action={repousseAction('moins')}
              img={'/tronc-faible.svg'} />
          </div>
        </div>

        <div class="group">
          <div class="bouton">
            <Bouton
              name="pesanteur +"
              type="light"
              action={graviteAction('plus')}
              img={'/gravity-high.svg'} />
          </div>
          <div class="bouton">
            <Bouton
              name="pesanteur -"
              type="light"
              action={graviteAction('moins')}
              img={'/gravity-low.svg'} />
          </div>
        </div>
      {/if}
    {/if}
    <div class="group">
      <div class="bouton">
        <Bouton
          name="STOP"
          type="light"
          action={() => {
            controles = false;
            simulation.stop();
          }} />
      </div>
      <div class="bouton">
        <Bouton
          name="RESTART"
          type="light"
          action={() => simulation.alphaTarget(0.2).restart()} />
      </div>
    </div>

  </div>
  <div>
    <svg bind:this={svg} />
  </div>
</div>
