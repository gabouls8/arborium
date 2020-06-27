<script>
  import Welcome from "./Welcome.svelte";
  import { showModal } from "./../../../stores/layoutTriggers.js";
  import firebase, { db } from "./../../../_firebase.js";
  let email = "";
  let password = "";
  let password2 = "";
  let errorMessage = "";

  $: emailIsValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
  $: passwordIsValid = password.length > 5;
  $: passwordMatch = password === password2;

  const signUp = () => {
    if (emailIsValid && passwordIsValid && passwordMatch) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(res =>
          db
            .collection("users")
            .doc(res.user.uid)
            .set({ email: res.user.email })
            .then(res2 => {
              showModal.set(Welcome);
            })
        ) //
        .catch(function(error) {
          // Handle Errors here.
          errorMessage = error.message;
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
    border: none;
    background-color: green;
    border-radius: 2px;
    color: white;
    font-size: bold;
    width: 50%;
  }
  .invalid {
    border-color: red;
  }
  .valid {
    border-color: green;
  }
  .error {
    color: red;
  }
</style>

<form on:submit|preventDefault={signUp}>

  <div>
    <input
      class:invalid={!emailIsValid & (email.length > 0)}
      class:valid={emailIsValid}
      bind:value={email}
      type="email"
      required="required" />
    <span class:floating-label={email.length > 0}>Email :</span>
  </div>
  <div>
    <input
      class:invalid={!passwordIsValid && password.length > 0}
      class:valid={passwordIsValid}
      bind:value={password}
      type="password"
      required="required" />
    <span class:floating-label={password.length > 0}>
      Mot de passe : (6 caractères min.)
    </span>
    <div>
      <input
        class:invalid={!passwordMatch && password2.length > 0}
        class:valid={passwordMatch && password2.length > 0}
        bind:value={password2}
        type="password"
        required="required" />
      <span class:floating-label={password2.length > 0}>
        Répeter mot de passe :
      </span>
    </div>
    <p class="error">{errorMessage}</p>

    <div class="button-container">
      <input class="button" type="submit" value="S'inscrire" />
    </div>

  </div>
</form>
