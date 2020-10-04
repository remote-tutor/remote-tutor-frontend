<template>
  <v-app>
    <AppBar page-name="Videos"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <div>Please note that the video will be created with the chosen settings (Year, Selected Day)</div>
        </v-row>
        <v-row>
          <v-col cols="12" md="3" v-if="userData.admin">
            <v-row>
              <v-col>
                <v-date-picker v-model="date" full-width first-day-of-week="5"
                               :picker-date.sync="pickedMonth"></v-date-picker>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select
                    label="Year"
                    :items="years"
                    item-text="text"
                    item-value="value"
                    v-model="selectedYear"
                    @change="getVideos"
                ></v-select>
              </v-col>
              <v-col cols="6" align-self="center">
                <v-btn color="primary" @click="createVideo" :loading="createLoading">Create Video</v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-row>
              <VideoCard
                  v-for="(video, index) in videos"
                  :key="video.ID"
                  :index="index + 1"
                  :video="video"
                  @videoUpdated="getVideos"
                  @videoDeleted="getVideos"
              ></VideoCard>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="dialog" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please stand by
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import {mapState} from "vuex";
import api from "@/gateways/api";
import VideoCard from "@/components/videos/admins/VideoCard";

export default {
  name: "Videos",
  components: {VideoCard, AppBar},
  computed: {
    ...mapState(['userData']),
  },
  data() {
    return {
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      selectedYear: 1,
      pickedMonth: null,
      createLoading: false,
      videos: [],
      dialog: false,
    }
  },
  methods: {
    getVideos() {
      this.dialog = true
      api({
        method: "GET",
        url: "/videos",
        params: {
          year: this.selectedYear,
          date: new Date(this.pickedMonth).getTime(),
        }
      }).then(response => {
        this.videos = response.data.videos
      }).finally(() => {
        this.dialog = false
      })
    },
    createVideo() {
      this.createLoading = true
      let formData = new FormData()
      formData.append("year", this.selectedYear)
      formData.append("availableFrom", new Date(this.date).getTime())
      api({
        method: "POST",
        url: "/admin/videos",
        data: formData,
      }).then(response => {
        this.$router.push({name: 'EditVideo', params: {videoID: response.data.video.ID}})
      }).finally(() => {
        this.createLoading = false
      })
    }
  },
  mounted() {
    this.getVideos()
  },
  watch: {
    pickedMonth() {
      this.getVideos()
    },
  },
}
</script>

<style scoped>

</style>