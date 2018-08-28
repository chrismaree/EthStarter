<template>
  <div class="home">
    <h1>Welcome to EthStarter!</h1>
    <br>
    <img alt="Vue logo" src="../assets/donate-solid.svg" style="width:250px">
    <HelloWorld class="center"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>

