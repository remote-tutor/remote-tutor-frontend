<template>
  <v-col cols="12" sm="6" md="4">
    <v-card shaped elevation="6" :id="'card-' + video.ID">
      <v-card-title style="overflow: hidden">
        <div class="card-title-div">
          {{ video.title }}
        </div>
      </v-card-title>
      <v-card-subtitle>Video #{{ index }}
        <v-progress-circular v-if="pendingAccess" indeterminate></v-progress-circular>
        <v-tooltip bottom v-else-if="access">
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="green" dark v-bind="attrs" v-on="on">mdi-check-bold</v-icon>
          </template>
          <span>You have access to view this video when it's available</span>
        </v-tooltip>
        <div v-else-if="typingCode">
          <v-text-field
              label="Code"
              single-line
              prepend-icon="mdi-barcode"
              append-icon="mdi-check"
              @click:append="checkCode"
              type="text"
              v-model="codeToUse"
          ></v-text-field>
        </div>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="red" dark v-bind="attrs" v-on="on" @click="typingCode = true">mdi-close-circle</v-icon>
          </template>
          <span>Click to use code</span>
        </v-tooltip>
      </v-card-subtitle>
      <v-card-text>
        <p>Available From: {{ video.availableFrom | moment }}</p>
      </v-card-text>
      <v-card-actions v-if="isAvailableToWatch">
        <v-btn outlined :to="{name: 'ViewVideo', params: {videoHash: video.hash}}">Parts</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import moment from "moment";
import api from "@/gateways/api";

export default {
  name: "VideoCard",
  props: ['index', 'video'],
  data() {
    return {
      access: false,
      pendingAccess: false,
      codeToUse: '',
      typingCode: false
    }
  },
  computed: {
    isAvailableToWatch() {
      return new Date() >= new Date(this.video.availableFrom) && this.access;
    }
  },
  methods: {
    getVideoPermission() {
      this.pendingAccess = true
      api({
        method: "GET",
        url: "/videos/codes/code",
        params: {
          videoID: this.video.ID
        }
      }).then(response => {
        this.access = response.data.status
      }).finally(() => {
        this.pendingAccess = false
      })
    },
    checkCode() {
      this.typingCode = false
      this.pendingAccess = true
      let formData = new FormData()
      formData.append("code", this.codeToUse)
      formData.append("videoID", this.video.ID)
      api({
        method: "PUT",
        url: "/videos/codes/code",
        data: formData,
      }).then(() => {
        this.access = true
      }).catch(() => {
        this.typingCode = true
      }).finally(() => {
        this.pendingAccess = false
      })
    }
  },
  mounted() {
    this.getVideoPermission()
  },
  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
    momentDifference: function (availableFrom) {
      let now = moment()
      availableFrom = moment(availableFrom)
      let diff = now.diff(availableFrom, 'minutes');
      return diff >= 0;

    }
  }
}
</script>

<style scoped>
.v-card__title {
  word-break: break-word;
}

.card-title-div {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
}
</style>