<template>
  <div>
    <v-app-bar color="black" dense dark app clipped-left >
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="!$vuetify.breakpoint.mdAndUp"></v-app-bar-nav-icon>
      <v-avatar tile>
        <v-img :src="require('@/assets/logo.png')"></v-img>
      </v-avatar>

      <v-toolbar-title>{{ pageName }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-tooltip bottom v-if="!userData.admin">
        <template v-slot:activator="{ on }">
          <v-btn icon large v-on="on" @click="dialog = true">
            <v-icon>mdi-cash</v-icon>
          </v-btn>
        </template>
        <span>Payments</span>
      </v-tooltip>

    </v-app-bar>
    <Drawer :static-open="drawer" @closedDrawer="(options) => this.drawer = options.value"></Drawer>
    <Payment :student-name="userData.name" :dialog.sync="dialog"></Payment>
  </div>
</template>

<script>
import Drawer from "@/components/utils/Drawer";
import Payment from "@/components/payments/shared/Payment";
import {mapState} from "vuex";

export default {
  name: "AppBar",
  props: ["pageName"],
  components: {
    Drawer,
    Payment
  },
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      drawer: false,
      dialog: false,
    };
  },
}
</script>

<style scoped>

</style>