<template>
  <v-app>
    <AppBar page-name="Edit Video"></AppBar>
    <v-main>
      <v-container>
        <Video></Video>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Video from "@/components/videos/admins/Video";
import AppBar from "@/components/utils/AppBar";
export default {
name: "Videos",
  components: {AppBar, Video}
}
</script>

<style scoped>

</style>