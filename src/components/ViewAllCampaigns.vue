<template>
    <div class="ViewCampaign">
  <div v-for="index in numberOfCampaigns" :key="index">
<el-card class="contentCard">
<ViewCampaign :campaignID="index-1" />
</el-card>
<br>
        </div>
    </div>
</template>

<script>
import {
  loadCampaignManager,
  getNumberOfCampaigns
} from "../../utils/CampaignManagerInterface";

import ViewCampaign from "@/components/ViewCampaign.vue";

export default {
  name: "ViewAllCampaigns",
  components: {
    ViewCampaign
  },
  props: {
    campaignID: Number
  },
  data() {
    return {
      numberOfCampaigns: 0
    };
  },
  methods: {},
  async mounted() {
    await loadCampaignManager();
    this.numberOfCampaigns = await getNumberOfCampaigns();
    this.numberOfCampaigns = parseInt(this.numberOfCampaigns);
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

.contentCard {
  max-width: 1200px;
  /* text-align: center; */
}
</style>
