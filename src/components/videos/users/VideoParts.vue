<template>
  <v-row>
    <v-col cols="12" sm="6" md="4">
      <v-card>
        <v-card-title>Parts</v-card-title>
        <v-card-text>
          <div v-for="(element, index) in parts" :key="element.name">
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="list-group-item">
                  <div v-if="element.isVideo">
                    Part#{{ player.getVideoPartNumber(element.ID, parts) }}: {{ element.name }}
                  </div>
                  <div v-else>
                    File: {{ element.name }}
                  </div>
                </v-list-item-title>
                <v-list-item-subtitle v-if="watches[index] !== undefined && element.isVideo">
                  <div v-if="watches[index].userID === 0 && watches[index].videoPartID === 0">
                    You haven't started watching this part yet
                  </div>
                  <div v-else-if="new Date() < new Date(watches[index].validTill)">
                    <Timer :end-time="watches[index].validTill" :time-up.sync="timers[index]"></Timer>
                    <div>{{ watches[index].validTill | momentFormatDate }}</div>
                  </div>
                  <div v-else>You've watched this part</div>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-icon>
                <v-progress-circular indeterminate v-if="watches.length === 0 && element.isVideo"></v-progress-circular>
                <v-btn icon v-else-if="(watches[index] !== undefined && element.isVideo) &&
                        (watches[index].userID === 0 && watches[index].videoPartID === 0 ||
                        new Date() < new Date(watches[index].validTill))">
                  <v-icon @click="viewPart(element, index)">
                    mdi-play
                  </v-icon>
                </v-btn>
                <v-btn icon :loading="element.link === null" v-if="!element.isVideo">
                  <v-icon @click="player.getPDF(element)">
                    mdi-open-in-new
                  </v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-list-item>
            <v-divider></v-divider>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="8">
      <Player ref="player" :video="video"></Player>
    </v-col>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="headline">
          Start Selected Part ?
        </v-card-title>
        <v-card-subtitle>{{ partName }}</v-card-subtitle>
        <v-card-text>
          Are you sure you want to start this part ? You'll have {{ video.studentHours }} hours from now to finish it,
          after that you won't
          able to watch it
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="createWatch">
            Yes Start it Now!
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="timeUpDialog" width="500" persistent>
      <v-card>
        <v-card-text>
          The timespan available for this video has ended.
          <br>
          The page will reload in 5 seconds
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-row>
</template>

<script>
import api from "@/gateways/api";
import Timer from "@/components/utils/Timer";
import Player from "@/components/videos/shared/Player";
import moment from 'moment'
import {mapState} from "vuex";

export default {
  name: "VideoParts",
  components: {Player, Timer},
  props: ['video'],
  computed: {
    ...mapState(["isLoggedIn"]),
    player() {
      return this.$refs.player
    }
  },
  data() {
    return {
      parts: [],
      watches: [],
      timers: [],
      cachedTimers: [],
      partName: '',
      dialog: false,
      timeUpDialog: false,
      selectedIndex: -1,
    };
  },
  methods: {
    getParts() {
      api({
        method: "GET",
        url: "/videos/parts",
        params: {
          videoHash: this.$route.params.videoHash
        }
      }).then(response => {
        this.parts = response.data.parts
        let watchesToGet = []
        this.parts.forEach(part => {
          watchesToGet.push(this.getUserWatchForPart(part.ID))
        })
        Promise.all(watchesToGet).then(responses => {
          responses.forEach(response => {
            this.watches.push(response.data.watch)
            this.timers.push(false)
          })
          this.cachedTimers = Object.assign([], this.timers)
        })

      })
    },
    viewPart(part, index) {
      this.selectedIndex = index
      if (this.isLoggedIn) {
        if (this.watches[index].userID === 0 && this.watches[index].videoPartID === 0)
          this.dialog = true
        else {
          this.player.startPart(part, index)
        }
      } else {
        this.player.startStaticPart(part, index)
      }
    },
    getUserWatchForPart(partID) {
      return api({
        method: "GET",
        url: "/videos/watches/watch",
        params: {
          partID: partID,
        }
      })
    },
    createWatch() {
      let formData = new FormData()
      formData.append("videoPartID", this.parts[this.selectedIndex].ID)
      api({
        method: "POST",
        url: "/videos/watches",
        data: formData
      }).then(response => {
        this.watches.splice(this.selectedIndex, 1, response.data.watch)
        this.player.startPart(this.parts[this.selectedIndex], this.selectedIndex)
      }).finally(() => {
        this.dialog = false
      })
    }
  },
  watch: {
    timers: {
      handler(val) {
        for (let i = 0; i < val.length; i++) {
          if (val[i] !== this.cachedTimers[i]) {
            if (this.selectedIndex === i) {
              this.timeUpDialog = true
              this.player.stop()
              setTimeout(
                  function () {
                    window.location.reload()
                  }, 5000
              )
            }
            this.cachedTimers[i] = val[i]
          }
        }
      },
      deep: true
    },
  },
  filters: {
    momentFormatDate: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  },
  mounted() {
    if (this.isLoggedIn)
      this.getParts()
    else {
      this.parts = this.video.parts
      this.watches = [
        {validTill: new Date().setHours(new Date().getHours() + 1)}
      ]
    }
  }
}
</script>

<style scoped>

</style>