<template>
  <div class="ViewCampaign">
    <h1>campaignID {{ campaignID }}</h1>

    <el-button @click="search" class="button is-primary is-fullwidth subtitle">Load Hash</el-button>

    campaignData {{contractReturnedData}}

    ipfsReturnedData {{ipfsReturnedData}}


<hr>
    <div v-html="ipfsReturnedData.longDescription"></div>
    <img class="preview" :src="ipfsReturnedData.imageData">
  </div>
</template>

<script>
import { viewFile } from "../../utils/IPFSUploader";

import {
  loadCampaignManager,
  getNumberOfCampaigns,
  fetchCampaign
} from "../../utils/CampaignManagerInterface";

export default {
  name: "ViewCampaign",
  props: {
    campaignID: Number
  },
  data() {
    return {
      contractReturnedData: [],
      ipfsReturnedData: {},
    };
  },
  methods: {
    async search() {
      this.contractReturnedData = await fetchCampaign(this.campaignID);
      // Note that this subindexing should potentually be done in the campaign manager interface
      // but this extra seperation of conserns will make the process less efficiant. Coupling of layers
      // is worth it here until I can think of a better way to do it while keeping effecient
      console.log(this.contractReturnedData[8]);
      this.ipfsReturnedData = await viewFile(this.contractReturnedData[8]);
    }
  },
  async mounted() {
    await loadCampaignManager();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
