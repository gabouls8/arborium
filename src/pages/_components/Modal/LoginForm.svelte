<script>
	import { showModal } from './../../../stores/layoutTriggers.js';
	import WelcomeBack from './WelcomeBack.svelte';
	import firebase from './../../../_firebase.js';
  let email = "";
  let password = "";
  let errorMessage = "";
  $: emailIsValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
  $: passwordIsValid = password.length > 0;

  const login = () => {
    if (emailIsValid && passwordIsValid) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(res=>showModal.set(WelcomeBack))
        .catch(function(error) {
          // Handle Errors here.
          errorMessage = error.message;
          // ...
        });
    } else {
      console.log("not valid not send");
    }
  };
</script>

<style>
  input {
    width: 100%;
    font-size: 0.9rem;
    border: none;
    margin-bottom: 1rem;
    border-bottom: 2px solid rgb(202, 202, 202);
    border-radius: 0px;
    padding: 1rem;
    transition: width 2s, height 4s;
  }
  input:focus ~ span,
  .floating-label {
    position: absolute;
    top: -5px;
    left: 0px;
    font-size: 0.7rem;
    opacity: 1;
  }
  span {
    position: absolute;
    pointer-events: none;
    left: 10px;
    top: 25px;
    transition: 0.2s ease all;
  }
  input:focus {
    outline: none;
  }
  div {
    position: relative;
  }
  .button-container {
    display: flex;
    align-items: center;
  }
  .button {
    margin: 1rem auto;
    border:  none;
    background-color: green;
    border-radius: 2px;
    color:white;
    font-size: bold;
    width:50%;
  }
  .invalid {
    border-color: red;
  }
  .valid {
    border-color:rgb(202, 202, 202);
  }
  .error {
    color: red;
  }
</style>

<form on:submit|preventDefault={login}>

  <div>

    <input
      class:invalid={!emailIsValid & (email.length > 0)}
      class:valid={emailIsValid}
      bind:value={email}
      id="email"
      type="email"
      required="required" />
    <span class:floating-label={email.length > 0}>Email :</span>
  </div>
  <div>
    <input
      class:invalid={!passwordIsValid && password.length > 0}
      class:valid={passwordIsValid}
      bind:value={password}
      id="password"
      type="password"
      required="required" />
    <span class:floating-label={password.length > 0}>
      Mot de passe : (6 caractères min.)
    </span>
  </div>
      <p class="error">{errorMessage}</p>

  <div class="button-container">
      <input class="button" type="submit" value="Se connecter">
  </div>

</form>
