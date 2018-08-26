<template>
  <div class="app">
    

  <el-header class="nav">
    <router-link to="/">Home</router-link> |
      <router-link to="/EthereumContracts">Ethereum Contracts </router-link> |
      <router-link to="/IPFSExamples">IPFS Examples</router-link> |
      <router-link to="/CreateNewCampaign">Create New Campaign</router-link> |
      <router-link to="/ViewCampaigns">View Campaigns</router-link>
       <br>
       <hr class="navBarLine">
  </el-header>
  <el-main>
    <router-view/>
  </el-main>

  </div>
</template>

<script>
import EthereumInfo from '@/components/EthereumInfo.vue'

export default {
  components: {
    EthereumInfo
  }
}
</script>


<style lang="scss">
.app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.navBarLine {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
