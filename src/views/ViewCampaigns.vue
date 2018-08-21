<template>
    <div class="ViewCampaigns">
        <br>
        <ViewCampaign :campaignID=0 />
    </div>
</template>

<script>
    // @ is an alias to /src
    import ViewCampaign from '@/components/ViewCampaign.vue'

    export default {
        name: 'ViewCampaigns',
        components: {
            ViewCampaign
        }
    }
</script>
