<template>
  <v-app>
    <AppBar page-name="Video"></AppBar>
    <v-main>
      <v-container v-if="mounted">
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
import static_videos from "@/static-data/videos.json"

export default {
  name: "Videos",
  components: {UserVideoParts, AppBar, AdminVideoParts},
  data() {
    return {
      video: null,
      mounted: false,
    }
  },
  computed: {
    ...mapState(['userData', 'isLoggedIn']),
  },
  created() {
    if (this.isLoggedIn) {
      api({
        method: "GET",
        url: "/videos/video",
        params: {
          videoHash: this.$route.params.videoHash
        }
      }).then(response => {
        this.video = response.data.video
        this.mounted = true
      })
    } else {
      let videoHash = this.$route.params.videoHash
      if (videoHash === "CALCINDYNAMICS") {
        this.video = static_videos[0]
      } else if (videoHash === "DIFFTRCKS")
        this.video = static_videos[1]
      else
        this.video = static_videos[2]
      this.mounted = true
    }
  }
}
</script>

<style scoped>

</style>