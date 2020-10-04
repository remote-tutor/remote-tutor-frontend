<template>
  <div>
    <v-file-input
        chips
        multiple
        show-size
        counter
        label="Upload Video (You can select multiple files to be uploaded)"
        v-model="videoParts"
    ></v-file-input>

    <div v-if="videoParts.length > 0">You can drag and drop the following list items to reorder the parts</div>
    <draggable class="list-group" v-model="videoParts" v-bind="dragOptions">
      <transition-group type="transition" name="flip-list">
        <v-list-item class="list-group-item" v-for="(element, index) in videoParts" :key="element.name">
          Part#{{ index + 1 }}: {{ element.name }}
        </v-list-item>
      </transition-group>
    </draggable>
    <v-btn v-if="videoParts.length > 0" block color="primary" @click="saveVideoParts">Save</v-btn>

    <v-dialog v-model="dialog" persistent width="500">
      <v-card>
        <v-card-title>
          Please stand by
        </v-card-title>
        <v-card-text>
          <v-row v-for="(progress, index) in progressIndicators" :key="progress.id">
            <v-col>
              <v-progress-linear v-model="progress.value"
                                 height="40"
                                 :color="(progress.finished) ? 'success' : 'blue-grey'"
                                 :indeterminate="progress.value > 99 && !progress.finished">
                <template v-slot="{ value }">
                  Part #{{ index + 1 }}: {{ videoParts[index].name }}
                  <v-spacer></v-spacer>
                  <strong v-if="progress.finished">
                    Uploaded
                    <v-icon>mdi-thumb-up</v-icon>
                  </strong>
                  <strong v-else-if="progress.value <= 99">{{ value }}%</strong>
                  <strong v-else>Finishing Up!</strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "VideoParts",
  data() {
    return {
      videoParts: [],
      dialog: false,
      progressIndicators: [],
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  methods: {
    saveVideoParts() {
      this.dialog = true
      let apiCalls = []
      this.progressIndicators = []
      this.videoParts.forEach((part, index) => {
        apiCalls.push(this.saveVideoPart(index))
        this.progressIndicators.push({value: 0, id: index, finished: false})
      })
      Promise.all(apiCalls).then(response => {
        console.log(response)
      }).finally(() => {
        this.dialog = false
      })
    },
    saveVideoPart(index) {
      let formData = new FormData()
      formData.append("videoPart", this.videoParts[index])
      formData.append("videoID", this.$route.params.videoID)
      formData.append("number", (index + 1))
      return api({
        method: "POST",
        url: "/admin/videos/parts",
        data: formData,
        onUploadProgress: (progressEvent) => {
          console.log(progressEvent)
          const totalLength = progressEvent.total
          if (!(totalLength === null || totalLength === undefined)) {
            this.progressIndicators[index].value = Math.round((progressEvent.loaded * 100) / totalLength);
          }
        }
      }).then(() => {
        this.progressIndicators[index].finished = true
      })
    },
  }
}
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}
</style>