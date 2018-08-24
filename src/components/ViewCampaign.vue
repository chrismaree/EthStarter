<template>
  <div class="ViewCampaign">
    
      <h1>Name: {{ipfsReturnedData.name}}</h1>
        <img class="preview" :src="ipfsReturnedData.imageData"><br>
        campaignID: {{ campaignID }}<br>
        Country: {{ipfsReturnedData.country}}<br>
        Description: {{ipfsReturnedData.shortDescription}}<br>
        Date: {{ipfsReturnedData.date}}<br>
        Goal and Cap: {{ipfsReturnedData.goalCap}}<br>
        Type: {{ipfsReturnedData.type}}<br>
        Manager: {{contractReturnedData[0]}}<br>
        Campaign Balance: {{contractReturnedData[3]}}<br>
        Funders: {{contractReturnedData[7]}}<br>
    <div v-html="ipfsReturnedData.longDescription"></div>
    <br>
    <br>
    Status: {{CampaignStatus}}<br>
        Time: {{CampaignStatusTime}}<br>
    
    <el-input-number :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" v-model="fundingAmount" :precision="2" :step="0.1"></el-input-number> Ether  
    <el-button :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" @click="fundCurrentCampaign" type="primary">Fund Campaign</el-button>
<br>
<div v-if="isFunder">
  </div>
    <p><strong>You have contributed to this probject!</strong> If the campaign has not ended you can reduce your donation. <br> Please not that you can only with reduce your donation if it wont make a passing campaign fail.</p>
    <el-input-number :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" v-model="reduceAmount" :precision="2" :step="0.1"></el-input-number> Ether  
    <el-button :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" @click="reduceDonationAmount" type="primary">Reduce Donation</el-button>
    <hr>
  </div>
</template>

<script>
import { viewFile } from "../../utils/IPFSUploader";

import {
  loadCampaignManager,
  getNumberOfCampaigns,
  fetchCampaign,
  fundCampaign,
  reduceDonation,
  refundFailedCampaign,
  withdrawCampaignFunds
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
      ipfsReturnedData: {},

      CampaignStatus: "", //Stores either: NotStarted, Running, Funded, UnderFunded.
      //same notion as in the contracts but here we need to calculate on the client side to
      //identify things like if: a fund is finished but unclaimed, it will still say Running on chain
      //Data is stored as: d, h, m, s;
      CampaignStatusTime: "",
      fundingAmount: 0,
      isFunder: false,
      reduceAmount:0
    };
  },
  methods: {
    async search() {
      this.contractReturnedData = await fetchCampaign(this.campaignID);
      // Note that this subindexing should potentually be done in the campaign manager interface
      // but this extra seperation of conserns will make the process less efficiant. Coupling of layers
      // is worth it here until I can think of a better way to do it while keeping effecient
      this.ipfsReturnedData = await viewFile(this.contractReturnedData[8]);
      //update the display for the time every second
      setInterval(
        function() {
          this.identifyCampaignStatus(this.contractReturnedData);
        }.bind(this),
        1000
      );
      await this.identifyIfContributer();
    },

    convertSeconds(seconds) {
      var d, h, m, s;
      s = parseInt(seconds);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return { d: d, h: h, m: m, s: s };
    },

    identifyCampaignStatus() {
      let currentTime = new Date() / 1000;
      //Has not started. current time less than the start time
      if (currentTime < this.contractReturnedData[1]) {
        this.CampaignStatus = "Not Started";
        let timeBetween = this.convertSeconds(
          this.contractReturnedData[1] - currentTime
        );
        this.CampaignStatusTime =
          "Campaign Starts in " +
          timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds";
      }
      //Is running. The current time is more than the start time, but less then the end time
      if (
        currentTime > this.contractReturnedData[1] &&
        currentTime < this.contractReturnedData[2]
      ) {
        this.CampaignStatus = "Running";
        let timeBetween = this.convertSeconds(
          this.contractReturnedData[2] - currentTime
        );
        this.CampaignStatusTime =
          "Campaign ends in " +
          timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds";
      }
      //Is Over. The current time is more than the end time
      if (currentTime > this.contractReturnedData[2]) {
        this.CampaignStatus = "Ended";
        let timeBetween = convertSeconds(
          this.contractReturnedData[2] - currentTime
        );
        this.CampaignStatusTime =
          "Campaign ended " +
          +timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds ago";
      }
    },
    async fundCurrentCampaign() {
      console.log(this.fundingAmount);
      await fundCampaign(this.campaignID, this.fundingAmount);
    },
    async identifyIfContributer() {
      if (
        this.contractReturnedData[7].indexOf(
          this.$store.state.defaultEthWallet.toLowerCase()
        ) > -1
      ) {
        this.isFunder = true;
      }
    },
    async withdrawFromCampaign() {},
    async reduceDonationAmount() {
      await reduceDonation(this.campaignID, this.reduceAmount)
    },
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
