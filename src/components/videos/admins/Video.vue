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
  </div>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "Video",
  data() {
    return {
      videoParts: [],
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
      let formData = new FormData()
      formData.append("videoPart", this.videoParts[0])
      formData.append("videoID", "1")
      formData.append("number", "1")
      api({
        method: "POST",
        url: "/admin/videos/parts",
        data: formData,
      })
    },
    saveVideoPart() {

    }
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