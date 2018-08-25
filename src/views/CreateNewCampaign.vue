<template>
  <div class="CreateNewCampaign">
    <h1> Create a new Campaign</h1>
      <CreateNewCampaignTable/>
  </div>
</template>

<script>
// @ is an alias to /src
import CreateNewCampaignTable from "@/components/CreateNewCampaignTable.vue";

export default {
  name: "CreateNewCampaign",
  components: {
    CreateNewCampaignTable
  }
};
</script>

<style>
.contentCard {
  max-width: 900px;
  /* text-align: center; */
}
</style>

