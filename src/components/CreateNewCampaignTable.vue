<template>
<div class="CreateNewCampaignTable">
<el-form ref="form" :model="form" label-width="400px">
  <el-form-item label="Campaign name">
    <el-input v-model="form.name"></el-input>
  </el-form-item>
  <el-form-item label="Campaign Country">
    <el-input v-model="form.country"></el-input>
  </el-form-item>
  <el-form-item label="Start and End date">
     <div class="block">
    <span class="demonstration">Default</span>
    <el-date-picker
      v-model="form.date"
      type="datetimerange"
      range-separator="To"
      start-placeholder="Start date"
      end-placeholder="End date">
    </el-date-picker>
  </div>
  </el-form-item>
  <el-form-item label="Campaign Type">
    <el-checkbox-group v-model="form.type">
      <el-checkbox label="Charity Fund Raising" name="type"></el-checkbox>
      <el-checkbox label="Community Initiative" name="type"></el-checkbox>
      <el-checkbox label="Personal Funding" name="type"></el-checkbox>
      <el-checkbox label="Project Kickstater" name="type"></el-checkbox>
      <el-checkbox label="Opensource Funding" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="Goal and Cap">
     <div class="block">
    <el-slider
      v-model="form.goalCap"
      range
      show-stops
      >
    </el-slider>
  </div>
  </el-form-item>
  
  <tinymce id="d1" 
            :other_options="tinyOptions" 
            v-model="form.description"
    ></tinymce>
<br>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">Create</el-button>
    <el-button>Cancel</el-button>
  </el-form-item>
</el-form>

{{ipfsCreatedAddress}}

<p>Load Hash</p>
        <input v-model="loadAddress" name="loadAddress" class="input" type="text">
        <br>
        <el-button @click="loadHash" class="button is-primary is-fullwidth subtitle">Load Hash</el-button>
        <br>
        {{retreivedText}}

</div>
</template>
<script>
import {uploadFile, viewFile} from "../../utils/IPFSUploader"

export default {
  name: "CreateNewCampaignTable",
  data() {
    return {
        
      tinyOptions: {
        height: 500
      },
      form: {
        name: "",
        country: "",
        date: "",
        goalCap: [10, 15],
        type: [],
        description: '<h2 style="color: #339966;">Hi there from EthStarter!</h2> <p>&nbsp;</p> <p><span>You can use this space to design and describe your campaign</span></p>',
      },
      ipfsCreatedAddress: '',
      loadAddress: '',
                retreivedText: ''
    };
  },
  methods: {
    async onSubmit() {
      let createdAddress = await uploadFile(this.form)
                this.$data.createdAddress = createdAddress
    },
    async loadHash() {
               let returnedValue = await viewFile(this.$data.loadAddress)
               this.$data.retreivedText = returnedValue
            }
  }
};
</script>