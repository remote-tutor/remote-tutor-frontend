<template>
  <div>
    <v-app-bar color="black" dense dark app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="!$vuetify.breakpoint.mdAndUp"></v-app-bar-nav-icon>

      <v-toolbar-title>Quizzes</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-tooltip bottom v-if="userData.admin && iconsNeeded">
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="createPlaceholder">
            <v-icon v-bind="attrs" v-on="on">mdi-plus-circle</v-icon>
          </v-btn>
        </template>
        <span>Create</span>
      </v-tooltip>
    </v-app-bar>
    <Drawer :static-open="drawer" @closedDrawer="(options) => this.drawer = options.value"></Drawer>
  </div>
</template>

<script>
import Drawer from "@/components/utils/Drawer";
import {mapState} from "vuex";
export default {
  name: "QuizzesAppBar",
  components: {
    Drawer,
  },
  props: ["placeholderExists", "iconsNeeded"],
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      sheet: false,
      drawer: false,
    };
  },
  methods: {
    createPlaceholder() {
      if (this.placeholderExists) {
        this.$store.dispatch("viewSnackbar", {
          text: "Please fill the unfinished one first",
          color: "error",
        });
      } else {
        this.$emit("createPlaceholder");
      }
    },
    closeSearchSheet() {
      this.sheet = false;
    },
    search(options) {
      this.closeSearchSheet();
      this.$emit("search", {
        searchValues: options.searchValues,
      });
    },
  },
};
</script>