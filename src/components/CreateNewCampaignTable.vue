<template>
<div class="CreateNewCampaignTable">
<el-form ref="form" :model="form" label-width="150px">
<el-row>
  <el-col :span="9" :offset="6">
    <el-form-item label="Campaign name">
    <el-input v-model="form.name"></el-input>
  </el-form-item>
  <el-form-item label="Campaign Country">
    <el-input v-model="form.country"></el-input>
  </el-form-item>
  <el-form-item label="Short Description">
        <el-input type="textarea" v-model="form.shortDescription"></el-input>
  </el-form-item>
  <el-form-item label="Start and End date">
     <div class="block">
    <el-date-picker
      v-model="form.date"
      type="datetimerange"
      range-separator="To"
      start-placeholder="Start date"
      end-placeholder="End date">
    </el-date-picker>
  </div>
  </el-form-item>
  
  </el-col>
  <el-col :span="5">
    
    
                Campaign Image
                <input type="file" @change="previewImage" accept="image/*">
            
            <div class="image-preview" v-if="form.imageData.length > 0">
                <img class="preview" :src="form.imageData">
            </div>
  </el-col>
</el-row>

  <el-row>
    <el-col :span="15" :offset="6">

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
            v-model="form.longDescription"
    ></tinymce>
    </el-col>
  </el-row>

  
<br>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">Create</el-button>
    
  </el-form-item>
</el-form>  

{{ipfsCreatedAddress}}

</div>
</template>
<script>
import { uploadFile, viewFile } from "../../utils/IPFSUploader";
import {
  loadCampaignManager,
  createNewCampaign
} from "../../utils/CampaignManagerInterface";

export default {
  name: "CreateNewCampaignTable",
  data() {
    return {
      tinyOptions: {
        height: 500
      },
      form: {
        imageData: "",
        name: "",
        country: "",
        shortDescription: "",
        date: "",
        goalCap: [10, 15],
        type: [],
        longDescription:
          '<h2 style="color: #339966;">Hi there from EthStarter!</h2> <p>&nbsp;</p> <p><span>You can use this space to design and describe your campaign</span></p>'
      },
      ipfsCreatedAddress: "",
      loadAddress: "",
      retreivedText: ""
    };
  },
  methods: {
    previewImage: function(event) {
      var input = event.target;
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = e => {
          this.form.imageData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    async onSubmit() {
      let createdAddress = await uploadFile(this.form);
      let startTime = Math.floor(Date.parse(this.form.date[0]) / 1000);
      let endTime = Math.floor(Date.parse(this.form.date[1]) / 1000);
      let goal = this.form.goalCap[0];
      let cap = this.form.goalCap[1];
      let campaignTx = await createNewCampaign(
        startTime,
        endTime,
        goal,
        cap,
        createdAddress
      );
    },
    async loadHash() {
      let returnedValue = await viewFile(this.$data.loadAddress);
      this.$data.retreivedText = returnedValue;
    }
  },
  async mounted(){
    await loadCampaignManager()
  }
};
</script>

<style>
img.preview {
  width: 300px;
  background-color: white;
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}
</style>
