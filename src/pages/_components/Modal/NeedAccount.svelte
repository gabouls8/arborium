<script>
	import SignUpForm from './SignUpForm.svelte';
	import LoginForm from './LoginForm.svelte';
  import { showModal } from "./../../../stores/layoutTriggers.js";
  const login = () => showModal.set(LoginForm);
  const signUp = () => showModal.set(SignUpForm);
</script>

<style>
  p {
    text-align: center;
  }
  span {
    text-decoration: underline;
    color: blue;
    cursor: pointer;
  }
</style>

<div>
  <p>
    <span  on:touchstart = {login} on:click={login} >Connectez-vous</span>
    ou
    <span  on:touchstart = {signUp} on:click={signUp} >inscrivez-vous</span>
    pour poster et voter.
  </p>
</div>
