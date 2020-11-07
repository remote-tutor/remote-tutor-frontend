<template>
  <v-app>
    <AppBar page-name="Video"></AppBar>
    <v-main>
      <v-container>
        <AdminVideoParts v-if="userData.admin" :video="video"></AdminVideoParts>
        <UserVideoParts v-else :video="video"></UserVideoParts>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AdminVideoParts from "@/components/videos/admins/VideoParts";
import AppBar from "@/components/utils/AppBar";
import {mapState} from "vuex";
import UserVideoParts from "@/components/videos/users/VideoParts";
import api from "@/gateways/api";

export default {
  name: "Videos",
  components: {UserVideoParts, AppBar, AdminVideoParts},
  data() {
    return {
      video: null
    }
  },
  computed: {
    ...mapState(['userData']),
  },
  created() {
    api({
      method: "GET",
      url: "/videos/video",
      params: {
        videoHash: this.$route.params.videoHash
      }
    }).then(response => {
      this.video = response.data.video
    })
  }
}
</script>

<style scoped>

</style>