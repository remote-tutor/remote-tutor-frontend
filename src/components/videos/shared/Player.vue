<template>
  <v-card>
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Video Name: {{ video.title }}</v-toolbar-title>
    </v-toolbar>
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Part Name: {{ partName }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-row justify="center" align="center" v-show="loading">
        <v-progress-circular indeterminate></v-progress-circular>
      </v-row>

      <vue-plyr ref="plyr" @error="errorOccurred" @play="play" v-show="!loading">
        <video autoplay>
          <!--<source src="https://media.vued.vanthink.cn/sparkle_your_name_am360p.mp4" type="video/mp4" size="360">-->
          <!--<source src="https://media.vued.vanthink.cn/sparkle_your_name_am720p.mp4" type="video/mp4" size="720">-->
          <!--<source src="https://media.vued.vanthink.cn/y2mate.com%20-%20sparkle_your_name_amv_K_7To_y9IAM_1080p.mp4" type="video/mp4" size="1080">-->
        </video>
      </vue-plyr>
    </v-card-text>
  </v-card>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "Player",
  props: ['video'],
  computed: {
    player() {
      return this.$refs.plyr.player
    },
  },
  data() {
    return {
      partName: '',
      videoSource: [],
      loading: false,
    }
  },
  methods: {
    startPart(part, index) {
      this.loading = true
      this.partName = `Part#${index + 1}: ${part.name}`
      api({
        method: "GET",
        url: "videos/part",
        params: {
          id: part.ID,
        }
      }).then(response => {
        this.videoSource.splice(0, 1, {
          src: response.data.url,
          size: 1080,
        })
      }).catch(() => {
        this.loading = false
        this.partName = "Error fetching video link"
        this.player.poster = require("@/assets/video-error.png")
      })
    },
    errorOccurred() {
      this.player.poster = require("@/assets/video-error.png")
      this.loading = false
      this.$store.dispatch('viewErrorSnackbar', 'Unexpected error occurred, please try again')
    },
    stop() {
      this.player.stop()
    },
    play() {
      this.loading = false
    },
  },
  watch: {
    videoSource: {
      handler(val) {
        this.player.source = {
          type: "video",
          sources: val,
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>