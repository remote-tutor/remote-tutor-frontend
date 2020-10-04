<template>
  <v-col cols="12" sm="6" md="4">
    <v-card shaped elevation="6" :id="'card-' + video.ID">
      <v-card-title>Video #{{ index }}
        <v-spacer></v-spacer>
        <v-tooltip bottom v-if="saved">
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="green" dark v-bind="attrs" v-on="on">mdi-check-bold</v-icon>
          </template>
          <span>Video data is saved</span>
        </v-tooltip>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="red" dark v-bind="attrs" v-on="on" @click="show = true">mdi-close-circle</v-icon>
          </template>
          <span>Video data is not saved!</span>
        </v-tooltip>
      </v-card-title>
      <v-card-subtitle>Available At: {{ video.availableFrom | moment }}</v-card-subtitle>
      <v-card-actions>
        <v-btn outlined :to="{name: 'EditVideo', params: {videoID: video.ID}}">Parts</v-btn>
        <v-spacer></v-spacer>
        <v-btn outlined color="error">Delete</v-btn>
        <v-btn icon @click="show = !show">
          <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>

          <v-card-text>
            <v-date-picker v-model="date" full-width first-day-of-week="5"></v-date-picker>
            <v-select
                label="Year"
                :items="years"
                item-text="text"
                item-value="value"
                v-model="year"
            ></v-select>
            <v-btn block rounded color="primary" @click="updateVideo" :loading="loading">Save</v-btn>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </v-col>
</template>

<script>
import moment from "moment";
import api from "@/gateways/api";

export default {
  name: "VideoCard",
  props: ['index', 'video'],
  computed: {
    date: {
      get() {
        return moment(this.video.availableFrom).format("YYYY-MM-DD")
      },
      set(val) {
        this.video.availableFrom = val
        this.saved = false
      }
    },
    year: {
      get() {
        return this.video.year
      },
      set(val) {
        this.video.year = val
        this.saved = false
      }
    }
  },
  data() {
    return {
      show: false,
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      saved: true,
      loading: false,
    }
  },
  methods: {
    updateVideo() {
      this.loading = true
      let formData = new FormData()
      formData.append("id", this.video.ID)
      formData.append("availableFrom", new Date(this.video.availableFrom).getTime())
      formData.append("year", this.video.year)
      api({
        method: "PUT",
        url: "/admin/videos",
        data: formData
      }).then(() => {
        this.saved = true
        this.show = false
        this.$emit('videoUpdated')
        let videoID = this.video.ID
        document.getElementById(`card-${videoID}`).classList.add('new-update')
        setTimeout(function () {
          document.getElementById(`card-${videoID}`).classList.remove('new-update')
        }, 5000);
      }).finally(() => {
        this.loading = false
      })
    }
  },
  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  }
}
</script>

<style scoped>
.new-update {
  background: #00bcd4;
}
</style>