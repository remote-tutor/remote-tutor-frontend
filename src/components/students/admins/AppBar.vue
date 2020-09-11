<template>
  <div>
    <v-app-bar color="black" dense dark app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="!$vuetify.breakpoint.mdAndUp"></v-app-bar-nav-icon>
      <v-toolbar-title>Students</v-toolbar-title>
    </v-app-bar>
    <Drawer :static-open="drawer" @closedDrawer="(options) => this.drawer = options.value"></Drawer>
  </div>
</template>

<script>
import Drawer from "@/components/utils/Drawer";

export default {
  name: "StudentsAppBar",
  components: {
    Drawer,
  },
  data() {
    return {
      drawer: false,
    };
  },
}
</script>

<style scoped>

</style>