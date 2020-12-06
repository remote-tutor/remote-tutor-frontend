<template>
  <div>
    <v-card>
      <v-card-title>
        Codes
        <v-spacer></v-spacer>
        <v-col cols="2">
          <v-text-field
              v-model="numberOfCodes"
              hint="Number of codes to generate"
              persistent-hint
              type="number"
              :rules="[rules.positiveNumber]"
          ></v-text-field>
        </v-col>

        <v-btn fab color="green" small :disabled="invalidGeneration" @click="generateCodes">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>Video Title: {{video.title}}</v-card-subtitle>
    </v-card>
  </div>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "VideoCodes",
  props: ['video'],
  data() {
    return {
      numberOfCodes: 1,
      rules: {
        positiveNumber: value => (value > 0 && value <= 250) || 'Value must be between 0 and 250',
      }
    }
  },
  computed: {
    invalidGeneration() {
      return this.numberOfCodes <= 0 || this.numberOfCodes > 250
    }
  },
  methods: {
    generateCodes() {
      let formData = new FormData()
      formData.append("videoID", this.video.ID)
      formData.append("numberOfCodes", this.numberOfCodes)
      api({
        method: "POST",
        url: "/admin/videos/codes",
        data: formData
      })
    }
  },
}
</script>

<style scoped>

</style>