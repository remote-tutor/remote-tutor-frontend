<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-file-input
            chips
            multiple
            show-size
            counter
            label="Upload Video (You can select multiple files to be uploaded)"
            v-model="partsToUpload"
        ></v-file-input>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <div v-if="allParts.length > 0">You can reorder the parts using the handler on the left</div>
        <draggable class="list-group" v-model="allParts" handle=".handle">
          <transition-group type="transition" name="flip-list">
            <div v-for="(element, index) in allParts" :key="element.name">
              <v-list-item>
                <v-list-item-icon>
                  <v-icon class="reorder handle">mdi-reorder-horizontal</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="list-group-item">Part#{{ index + 1 }}: {{ element.name }}</v-list-item-title>
                <v-list-item-icon v-if="element.ID">
                  <v-icon @click="viewPart(element, index)">mdi-play</v-icon>
                </v-list-item-icon>
                <v-list-item-icon>
                  <ConfirmationDialog
                      v-if="element.ID"
                      video-part
                      buttonText="Delete"
                      mainText="Delete This Part?"
                      :deleted-item-name="element.name"
                      message="You won't be able to restore the deleted video part!!"
                      @confirm="deletePart($event, element)"
                  ></ConfirmationDialog>
                </v-list-item-icon>
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </transition-group>
        </draggable>
      </v-col>
      <v-col cols="12" sm="6" md="8">
        <Player ref="player" :video="video"></Player>
      </v-col>
    </v-row>

    <v-btn v-if="allParts.length > 0" block color="primary" @click="saveVideoParts">Save</v-btn>

    <v-dialog v-model="progressDialog" persistent width="500">
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
                  Part #{{ index + 1 }}: {{ allParts[index].name }}
                  <v-spacer></v-spacer>
                  <strong v-if="progress.finished">
                    <span v-if="allParts[index].ID">Updated</span>
                    <span v-else>Uploaded</span>
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

    <v-dialog v-model="deleteLoading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please wait, we're deleting the part
          <v-progress-linear indeterminate color="white"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import api from "@/gateways/api";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import Player from "@/components/videos/shared/Player";

export default {
  name: "VideoContent",
  components: {Player, ConfirmationDialog},
  props: ['video'],
  data() {
    return {
      partsToUpload: [],
      allParts: [],
      progressDialog: false,
      progressIndicators: [],
      deleteLoading: false,
    };
  },
  watch: {
    partsToUpload: {
      handler(val) {
        for (let i = 0; i < this.allParts.length; i++) {
          if (this.allParts[i].ID === undefined) {
            this.allParts.splice(i, 1)
            i--;
          }
        }
        this.allParts = this.allParts.concat(val)
      },
      deep: true,
    },
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    player() {
      return this.$refs.player
    },
  },
  methods: {
    saveVideoParts() {
      this.progressDialog = true
      let apiCalls = []
      this.progressIndicators = []
      this.allParts.forEach((part, index) => {
        apiCalls.push(this.saveVideoPart(index))
        this.progressIndicators.push({value: 0, id: index, finished: false})
      })
      Promise.all(apiCalls).then(() => {
        this.getParts()
      }).finally(() => {
        this.progressDialog = false
      })
    },
    saveVideoPart(index) {
      let formData = new FormData()
      formData.append("videoPart", this.allParts[index])
      formData.append("id", this.allParts[index].ID)
      formData.append("videoID", this.video.ID)
      formData.append("fileName", this.allParts[index].name)
      formData.append("number", (index + 1))
      let method = (this.allParts[index].ID === undefined) ? "POST" : "PUT"
      return api({
        method: method,
        url: "/admin/videos/parts",
        data: formData,
        onUploadProgress: (progressEvent) => {
          const totalLength = progressEvent.total
          if (!(totalLength === null || totalLength === undefined)) {
            this.progressIndicators[index].value = Math.round((progressEvent.loaded * 100) / totalLength);
          }
        }
      }).then(() => {
        this.progressIndicators[index].finished = true
      })
    },
    getParts() {
      api({
        method: "GET",
        url: "/videos/parts",
        params: {
          videoHash: this.$route.params.videoHash
        }
      }).then(response => {
        this.allParts = []
        this.allParts = this.allParts.concat(response.data.parts)
      })
    },
    deletePart(valueFromConfirmation, element) {
      if (element.ID === undefined) {
        let index = this.partsToUpload.indexOf(element)
        this.partsToUpload.splice(index, 1)
      } else {
        this.deleteLoading = true
        let formData = new FormData()
        formData.append("id", element.ID)
        formData.append("typedName", valueFromConfirmation.typedValue)
        api({
          method: "DELETE",
          url: "/admin/videos/parts",
          data: formData,
        }).then(() => {
          this.getParts()
        }).finally(() => {
          this.deleteLoading = false
        })
      }

    },
    viewPart(element, index) {
      this.player.startPart(element, index)
    },
    test() {
    }
  },
  mounted() {
    this.getParts()
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

.reorder {
  cursor: move;
}
</style>