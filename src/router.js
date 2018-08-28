import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import CreateNewCampaign from './views/CreateNewCampaign.vue'
import ViewCampaigns from './views/ViewCampaigns.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/CreateNewCampaign',
            name: 'CreateNewCampaign',
            component: CreateNewCampaign
        },
        {
            path: '/ViewCampaigns',
            name: 'ViewCampaigns',
            component: ViewCampaigns
        },
    ]
})
