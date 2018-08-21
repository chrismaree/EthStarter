<template>
    <div class="ViewCampaigns">
        <br>
        <ViewAllCampaigns/>
    </div>
</template>

<script>
    // @ is an alias to /src
    import ViewCampaign from '@/components/ViewCampaign.vue'
    import ViewAllCampaigns from '@/components/ViewAllCampaigns.vue'

    export default {
        name: 'ViewCampaigns',
        components: {
            ViewCampaign,
            ViewAllCampaigns
        }
    }
</script>
