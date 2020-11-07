<template>
  <v-col cols="12" sm="6" md="4">
    <v-card shaped elevation="6" :id="'card-' + video.ID">
      <v-card-title style="overflow: hidden">
        <div class="card-title-div">
          {{ video.title }}
        </div>
      </v-card-title>
      <v-card-subtitle>Video #{{ index }}
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
      </v-card-subtitle>
      <v-card-text>Available At: {{ video.availableFrom | moment }}</v-card-text>
      <v-card-actions>
        <v-btn outlined :to="{name: 'ViewVideo', params: {videoHash: video.hash}}">Parts</v-btn>
        <v-spacer></v-spacer>
        <ConfirmationDialog
            buttonText="Delete"
            mainText="Delete This Item?"
            message="You won't be able to restore the deleted video or its parts"
            video
            :deleted-item-name="video.title"
            @confirm="deleteVideo"
        ></ConfirmationDialog>
        <v-btn icon @click="show = !show">
          <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-show="show">
          <v-divider></v-divider>

          <v-card-text>
            <v-text-field
                label="Title"
                v-model.trim="title"
                prepend-icon="mdi-format-text"
                counter>
            </v-text-field>
            <v-date-picker v-model="date" full-width first-day-of-week="5"></v-date-picker>
            <v-btn block rounded color="primary" @click="updateVideo" :loading="loading" :disabled="title.length === 0">
              Save
            </v-btn>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <v-dialog v-model="dialog" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please stand by
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-col>
</template>

<script>
import moment from "moment";
import api from "@/gateways/api";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";

export default {
  name: "VideoCard",
  components: {ConfirmationDialog},
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
    title: {
      get() {
        return this.video.title
      },
      set(val) {
        this.video.title = val
        this.saved = false
      }
    }
  },
  data() {
    return {
      show: false,
      saved: true,
      loading: false,
      dialog: false,
    }
  },
  methods: {
    updateVideo() {
      this.loading = true
      let formData = new FormData()
      formData.append("id", this.video.ID)
      formData.append("title", this.video.title)
      formData.append("availableFrom", new Date(this.video.availableFrom).getTime())
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
    },
    deleteVideo(valueFromConfirmation) {
      this.dialog = true
      let formData = new FormData()
      formData.append("id", this.video.ID)
      formData.append("typedTitle", valueFromConfirmation.typedValue)
      api({
        method: "DELETE",
        url: "/admin/videos",
        data: formData
      }).then(() => {
        this.$emit('videoDeleted')
      }).finally(() => {
        this.dialog = false
      })
    },
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