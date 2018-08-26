<template>
    <div class="ViewCampaigns">
        <h1>View all campaigns</h1>
        <h4>Projects Listed here are in chronological order of creation</h4>
        <ViewAllCampaigns class="center"/>
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


