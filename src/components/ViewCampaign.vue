<template>
  <div class="ViewCampaign">
    
    <h1>campaignID {{ campaignID }}</h1>
        Status: {{CampaignStatus}}<br>
        Time: {{CampaignStatusTime}}<br>
        Name: {{ipfsReturnedData.name}}<br>
        Country: {{ipfsReturnedData.country}}<br>
        Description: {{ipfsReturnedData.shortDescription}}<br>
        Date: {{ipfsReturnedData.date}}<br>
        Goal and Cap: {{ipfsReturnedData.goalCap}}<br>
        Type: {{ipfsReturnedData.type}}<br>
        Manager: {{contractReturnedData[0]}}<br>
        Campaign Balance: {{contractReturnedData[3]}}<br>
        Funders: {{contractReturnedData[7]}}<br>
       
    <div v-html="ipfsReturnedData.longDescription"></div>
    <img class="preview" :src="ipfsReturnedData.imageData">
    <hr>
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
      //Data returned from the contract is in the followign format as an array:
      // [0-> address manager,
      // 1-> uint startingTime,
      // 2-> uint endingTime,
      // 3-> uint balance,
      // 4-> uint goal,
      // 5-> uint cap,
      // 6-> State state,
      // 7-> address[] donersAddresses,
      // 8-> string ipfsHash]
      contractReturnedData: [],

      // Object that populates ipfsReturnedData is the same as that from CreateNewCampaignTable as
      // {imageData, name, country, shortDescription, date, goalCap, type, longDescription}

      // }
      ipfsReturnedData: {},

      CampaignStatus: "", //Stores either: NotStarted, Running, Funded, UnderFunded.
      //same notion as in the contracts but here we need to calculate on the client side to
      //identify things like if: a fund is finished but unclaimed, it will still say Running on chain
      //Data is stored as: d, h, m, s;
      CampaignStatusTime: ""
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
      await this.identifyCampaignStatus(this.contractReturnedData);
    },

    convertSeconds(seconds) {
      var d, h, m, s;
      s = parseInt(seconds)
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return { d: d, h: h, m: m, s: s };
    },

    async identifyCampaignStatus(contractData) {
      let currentTime = new Date() / 1000;
      console.log(this.convertSeconds(contractData[1] - currentTime))
      //Has not started. current time less than the start time
      if (currentTime < contractData[1]) {
        this.CampaignStatus = "Not Started";
        let timeBetween = this.convertSeconds(contractData[1] - currentTime);
        this.CampaignStatusTime= "Campaign Starts in " + timeBetween['d'] + " days, " + timeBetween['h'] + " hours and " + timeBetween['s'] +" seconds";
        //  = 
      }
      //Is running. The current time is more than the start time, but less then the end time
      if (currentTime > contractData[1] && currentTime < contractData[2]) {
        this.CampaignStatus = "Running";
        let timeBetween = this.convertSeconds(contractData[2] - currentTime);
        this.CampaignStatusTime = "Campaign ends in " + timeBetween['d'] + " days, " + timeBetween['h'] + " hours and " + timeBetween['s'] +" seconds";
      }
      //Is Over. The current time is more than the end time
      if (currentTime > contractData[2]) {
        this.CampaignStatus = "Ended";
        let timeBetween = convertSeconds(contractData[2] - currentTime);
        this.CampaignStatusTime = "Campaign ended " + + timeBetween['d'] + " days, " + timeBetween['h'] + " hours and " + timeBetween['s'] +" seconds" + "ago";
      }
      console.log();
    }
  },
  async mounted() {
    await loadCampaignManager();
    await this.search();
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
