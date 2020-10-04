<template>
  <v-col cols="12" sm="6" md="4">
    <v-card shaped elevation="6">
      <v-card-title>Video #{{ index }}</v-card-title>
      <v-card-subtitle>Available At: {{video.availableFrom | moment}}</v-card-subtitle>
      <v-card-actions>
        <v-btn outlined :to="{name: 'EditVideo', params: {videoID: video.ID}}">Parts</v-btn>
        <v-spacer></v-spacer>
        <v-btn outlined color="error">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import moment from "moment";

export default {
  name: "VideoCard",
  props: ['index', 'video'],
  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  }
}
</script>

<style scoped>

</style>