<template>
  <div class="hello">
      Wallet Address: {{this.$store.state.defaultEthWallet}}
      <br>
      Network Name: {{this.$store.state.netIdString}} 
      <br>
      Wallet Balance: {{this.$store.state.walletBalance}} 
    <h1>Campain Manager</h1>
    Starting Value
    
    <br>    
    <el-button type="submit" @click="loadContract" class="button is-primary is-fullwidth subtitle">Load Contract</el-button>
    <br>
  </div>
</template>

<script>
import {loadCampaignManager} from "../../utils/CampaignManagerInterface";

export default {
  name: "CampainManager",
  data() {
    return {
      loadAddress:0,
      contractCreation: {
          startingValue:0,
          from: ''
      },
      contract: '',
      retreviedValue: 0,
      userSetValue: 0
    };
  },
  methods: {
    async loadContract() {
        await loadCampaignManager()
    },
  }
};
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
