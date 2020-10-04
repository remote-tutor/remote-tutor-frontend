<template>
  <v-app>
    <AppBar page-name="Edit Video"></AppBar>
    <v-main>
      <v-container>
        <VideoParts></VideoParts>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import VideoParts from "@/components/videos/admins/VideoParts";
import AppBar from "@/components/utils/AppBar";
export default {
name: "Videos",
  components: {AppBar, VideoParts}
}
</script>

<style scoped>

</style>