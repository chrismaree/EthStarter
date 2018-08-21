<template>
  <div class="CreateNewCampaign">
    <CreateNewCampaignTable/>
  </div>
</template>

<script>
// @ is an alias to /src
import CreateNewCampaignTable from '@/components/CreateNewCampaignTable.vue'

export default {
  name: 'CreateNewCampaign',
  components: {
    CreateNewCampaignTable
  }
}
</script>
