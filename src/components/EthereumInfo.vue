<template>
  <div class="EthereumInfo">
      Address: {{this.$store.state.defaultEthWallet}}
      <br>
      Network: {{this.$store.state.netIdString}} 
      <br>
      Balance: {{this.$store.state.walletBalance/1000000000000000000}} Ether 
  </div>
</template>

<script>
import {loadCampaignManager} from "../../utils/CampaignManagerInterface";

export default {
  name: "EthereumInfo",
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
.EthereumInfo{
  text-align: left;
}
</style>
