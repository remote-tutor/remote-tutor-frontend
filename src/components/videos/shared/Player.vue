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

      <vue-plyr ref="plyr" @error="errorOccurred" @play="play" @pause="pause" @seeking="seeking" v-show="!loading">
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
  computed: {
    player() {
      return this.$refs.plyr.player
    },
  },
  data() {
    return {
      video: {},
      partName: '',
      partID: -1,
      videoSource: [],
      lastTimestamp: 0,
      loading: false,
    }
  },
  methods: {
    startPart(part, index) {
      this.loading = true
      if (part) {
        this.partID = part.ID
        this.partName = `Part#${index + 1}: ${part.name}`
        this.lastTimestamp = 0
      }
      api({
        method: "GET",
        url: "videos/part",
        params: {
          id: this.partID
        }
      }).then(response => {
        this.videoSource.splice(0, 1, {
          src: response.data.url,
          size: 1080,
        })
      })
    },
    errorOccurred() {
      this.startPart()
    },
    stop() {
      this.player.stop()
    },
    seeking() {
      this.lastTimestamp = this.player.currentTime // save the position that the user wants to seek to
    },
    play() {
      this.player.currentTime = this.lastTimestamp; // Seeks to the last seeked value the user requested
      this.loading = false
    },
    pause() {
      this.lastTimestamp = this.player.currentTime
    },
    getVideo() {
      api({
        method: "GET",
        url: "/videos/video",
        params: {
          id: this.$route.params.videoID
        }
      }).then(response => {
        this.video = response.data.video
      })
    },
  },
  mounted() {
    this.getVideo()
  },
  watch: {
    videoSource: {
      handler(val) {
        this.player.source = {
          type: 'video',
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