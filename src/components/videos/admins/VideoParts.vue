<template>
  <div>
    <v-tabs v-model="tab" background-color="info" dark>
      <v-tab>Content</v-tab>
      <v-tab>Codes</v-tab>
      <v-tab>Manual Access</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <VideoContent :video="video"></VideoContent>
      </v-tab-item>
      <v-tab-item>
        <VideoCodes :video="video"></VideoCodes>
      </v-tab-item>
      <v-tab-item>
        <VideoManualAccess :video="video"></VideoManualAccess>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import VideoContent from "@/components/videos/admins/VideoContent";
import VideoCodes from "@/components/videos/admins/VideoCodes";
import VideoManualAccess from "@/components/videos/admins/VideoManualAccess";
export default {
  name: "VideoParts",
  props: ['video'],
  components: {VideoManualAccess, VideoCodes, VideoContent},
  data() {
    return {
      tab: 0
    }
  },

}
</script>

<style scoped>

</style>