<script>
  import SignUpForm from "./Modal/SignUpForm.svelte";
  import LoginForm from "./Modal/LoginForm.svelte";
  import { showModal, gotCategories } from "./../../stores/layoutTriggers.js";
  import firebase from "./../../_firebase.js";
  import { user, gotUser, userDb } from "./../../stores/user.js";
  import Modal from "./Modal/Modal.svelte";

  const signIn = () => {
    showModal.set(LoginForm);
  };
  const signUp = () => {
    showModal.set(SignUpForm);
  };
  const signOut = () => {
    firebase.auth().signOut();
  };
</script>

<style>
  li {
    padding: 23px 10px;
  }
  li:hover {
    background-color: darkgreen;
    cursor: pointer;
  }
  @media (max-width: 780px) {
    li:hover {
      background-color: inherit;
      cursor: pointer;
    }
    li {
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }
  }
</style>

{#if $gotUser && !$user}
  <li on:click={signIn}>Connexion</li>
  <li on:click={signUp}>Inscription</li>
{:else if $user}
  <li>{$user.email}</li>
  <li on:click={signOut}>Déconnexion</li>
{/if}
