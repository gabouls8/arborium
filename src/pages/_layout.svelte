<script>
  import Spinner from "svelte-spinner";
  import { ready } from "@sveltech/routify";
  import { content, title } from "./../stores/textStore.js";
  import { categories } from "./../stores/categoriesStore.js";
  import Sidebar from "./_components/Sidebar.svelte";
  import Modal from "./_components/Modal/Modal.svelte";
  import {
    showSidebar,
    showModal,
    gotCategories,
    dev
  } from "./../stores/layoutTriggers.js";
  import firebase, { db } from "./../_firebase.js";
  import { user, gotUser, userDb } from "./../stores/user.js";
  import Header from "./_components/Header.svelte";
  import { observe } from "svelte-observable";

  if (location.hostname === "localhost") {
    dev.set(true);
  }

  const userObservable = observe(
    firebase.auth().onAuthStateChanged(async returnedUser => {
      try {
        $ready();
        user.set(returnedUser);
        if (!returnedUser) {
          console.log("no user");
          gotUser.set(true);
          if ($userDb) userDb.set({ votes: {} });
          if ($content) content.set({});
          if ($title) content.set({});
          //return "null";
        } else {
          let [userdoc, data] = await Promise.all([
            db
              .collection("users")
              .doc(returnedUser.uid)
              .get(),
            db
              .collection("users")
              .doc(returnedUser.uid)
              .collection("votesTemp")
              .get()
          ]);
          if (!userdoc.exists) {
            console.log("pas de compte sur la DB");
            gotUser.set(true);
            user.set();
            //return null;
          }
          if (userdoc.exists && userdoc.data().votes) {
            $userDb.votes = userdoc.data().votes;
            $userDb.answers = userdoc.data().answers;
          }
          let votesTemp = data.docs.map(d => d.data());
          votesTemp.forEach(voteTemp => {
            let id = voteTemp.message;
            //soit il n'y a pas de votes deja enregistrés sur le message, soit il y en a mais sans date, donc antérieurs à voteTemp
            if (!$userDb.votes[id] || !$userDb.votes[id].date) {
              $userDb.votes[id] = {
                vote: voteTemp.vote,
                date: voteTemp.date.valueOf()
              };
              //console.log($userDb.votes[id]);
            }
            //sinon il y en a sur le message dans vote temp
            else {
              if (voteTemp.date.valueOf() > $userDb.votes[id].date) {
                $userDb.votes[id] = {
                  vote: voteTemp.vote,
                  date: voteTemp.date.valueOf()
                };
              }
            }
          });
          gotUser.set(true);
          console.log("user");
          //return "user";
        }

        if ($gotCategories) {
          console.log("already categories");
          return null;
        } else {
          let catdata = await db.collection("categories").get();
          // .then(catdata => {
          //on va transformer ça en objet
          let catObject = {};
          catdata.docs[0].data().categories.forEach(c => {
            //if ((!$dev && c.id !== "1c0f80f3-2838-42ea-8caf-399b6e417d9d") || $dev)
              catObject[c.id] = c;
          });
          for (const cat of Object.keys(catObject)) {
            catObject[cat].subcat = {};
            catObject[cat].subcategories.forEach(sc => {
              catObject[cat].subcat[sc.id] = sc;
            });
            delete catObject[cat].subcategories;
          }
          //console.log(catObject)
          categories.set(catObject);
          gotCategories.set(true);
          console.log("got categories");
          return null;
          // })
          // .catch(e => {
          //   alert(e);
          //   throw new Error(e);
          // });
        }
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    })
  );
</script>

<style>
  .mainf {
    position: absolute;
    top: 64px;
    left: 200px;
    height: calc(100vh - 64px);
    width: calc(100vw - 200px);
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: white;
  }
  .mainf::-webkit-scrollbar {
    display: none;
  }

  .sidebar {
    box-sizing: border-box;
    position: absolute;
    top: 64px;
    width: 200px;
    height: calc(100vh - 64px);
    border-right: 1px solid #e0e0e0;
    overflow-y: scroll;
    z-index: 8;
    background-color: #f8f8f8;
  }
  .sidebar::-webkit-scrollbar {
    display: none;
  }
  .background {
    position: absolute;
    top: 64px;
    height: calc(100vh - 64px);
    width: 100vw;
    background-color: black;
    opacity: 0.3;
    z-index: 7;
  }

  @media (max-width: 780px) {
    .mainf {
      left: 0;
      width: 100vw;
    }
  }
  @media (max-width: 780px) {
    :global(.hides, .onlym, .onlyl) {
      display: none;
    }
  }
  @media (min-width: 781px) and (max-width: 950px) {
    :global(.onlys) {
      display: none;
    }
  }
  @media (min-width: 951px) {
    :global(.onlys) {
      display: none;
    }
  }
  .rest {
    position: absolute;
    top: 64px;
    left: 0px;
    height: calc(100vh - 64px);
    width: calc(100vw);
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

{#await $userObservable then go}
  <Header />
  {#if $gotUser && $gotCategories}
    <div id="main" class="mainf">
      <!-- {#if $categories} -->
      <slot />
      <!-- {/if} -->
    </div>
    {#if $showSidebar}
      <div
        class="onlys background"
        on:touchstart|stopPropagation|preventDefault={() => showSidebar.update(any => !any)}
        on:click={() => showSidebar.update(any => !any)} />
      <div class="sidebar">
        <Sidebar />
      </div>
    {/if}
  {:else}
    <div class="rest">
      <Spinner size="100" speed="1000" color="green" thickness="2" gap="40" />
    </div>
  {/if}

  {#if $showModal}
    <Modal on:close={() => showModal.set(false)}>
      <svelte:component this={$showModal} />
    </Modal>
  {/if}
{/await}
