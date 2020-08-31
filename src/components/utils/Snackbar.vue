<template>
  <div class="text-center">
    <v-snackbar v-model="visible" :top="true" :color="color" :dark="true">
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="updateVisible(false)">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Snackbar",
  
  computed: {
    ...mapState({
      text: 'text',
      color: 'color',
    }),
    visible: {
      get() {return this.$store.state.visible},
      set(value) {this.updateVisible(value)}
    }
  },
  methods: {
    updateVisible(value) {
      this.$store.state.visible = value
    }
  }
};
</script>