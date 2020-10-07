<template>
  <v-row>
    <v-col cols="12" sm="6" md="4">
      <v-card>
        <v-card-title>Parts</v-card-title>
        <v-card-text>
          <div v-for="(element, index) in allParts" :key="element.name">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="list-group-item">
                  Part#{{ index + 1 }}: {{ element.name }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon v-text="'mdi-play'" @click="viewPart(element, index)"></v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-divider></v-divider>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="8">
      <v-card v-show="partName.length > 0">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{ partName }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <vue-plyr ref="plyr">
            <video autoplay>
              <!--<source src="https://media.vued.vanthink.cn/sparkle_your_name_am360p.mp4" type="video/mp4" size="360">-->
              <!--<source src="https://media.vued.vanthink.cn/sparkle_your_name_am720p.mp4" type="video/mp4" size="720">-->
              <!--<source src="https://media.vued.vanthink.cn/y2mate.com%20-%20sparkle_your_name_amv_K_7To_y9IAM_1080p.mp4" type="video/mp4" size="1080">-->
            </video>
          </vue-plyr>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "VideoParts",
  computed: {
    player() {
      return this.$refs.plyr.player
    }
  },
  data() {
    return {
      allParts: [],
      videoSource: [],
      partName: '',
      loadingPart: false,
    };
  },
  methods: {
    getParts() {
      api({
        method: "GET",
        url: "/videos/parts",
        params: {
          videoID: this.$route.params.videoID
        }
      }).then(response => {
        this.allParts = response.data.parts
      })
    },
    viewPart(part, index) {
      this.player.pause()
      this.player.stop()
      this.videoSource = []
      this.partName = `Part#${index + 1}: ${part.name}`
      this.loadingPart = true
      api({
        method: "GET",
        url: "videos/part",
        params: {
          id: part.ID
        }
      }).then(response => {
        this.videoSource.push({
          src: response.data.url,
          size: 1080,
        })
        this.player.source = {
          type: 'video',
          sources: this.videoSource
        }
      }).finally(() => {
        this.loadingPart = false
      })
    },
  },
  mounted() {
    this.getParts()
  }
}
</script>

<style scoped>

</style>