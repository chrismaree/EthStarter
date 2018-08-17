<template>
    <div class="OrbitDB">
        <h1>OrbitDB implementation</h1>
        <p>Create DB</p>
        <input v-model="createName" name="createName" class="input" type="text">
        <br>
        <el-button @click="create" class="button is-primary is-fullwidth subtitle">Create DB</el-button>
        <br>
        <p>Load DB</p>
        <input v-model="loadAddress" name="loadAddress" class="input" type="text">
        <br>
        <el-button @click="load" class="button is-primary is-fullwidth subtitle">Load DB</el-button>
        <br>
        <p>Mutator</p>
        <input v-model="addValue" name="addValue" required class="input" type="number" min=0, max=100>
        <br>
        <el-button @click="add" class="button is-primary is-fullwidth subtitle">Add To Orbitdb</el-button>
        <br>
        <p>Accessor</p>
        <el-button @click="get" class="button is-primary is-fullwidth subtitle">Get Value</el-button>
        <br>
        {{returnedValue}}
    </div>
</template>
<script>
    import {createDB, loadDB, addValueToLog, getValuesFromLog} from "../../utils/OrbitDB.js";

    export default {
        name: "OrbitDB",
        data() {
            return {
                addValue: 0,
                createName: '',
                loadAddress: '',
                returnedValue: ''
            };
        },
        methods: {
            async create() {
                await createDB(this.$data.createName)
            },

            async load() {
                await loadDB(this.$data.loadAddress)
            },

            async add() {
                const addValueAsync = await addValueToLog(this.$data.addValue)
            },
            async get() {
                const getValueAsync = await getValuesFromLog(5)
                this.$data.returnedValue = getValueAsync
            }
        }
    }
</script>