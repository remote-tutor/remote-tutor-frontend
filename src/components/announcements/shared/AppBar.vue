<template>
  <div>
    <v-app-bar color="black" dense dark app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="!$vuetify.breakpoint.mdAndUp"></v-app-bar-nav-icon>

      <v-toolbar-title>Announcements</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-bottom-sheet v-model="sheet" inset>
        <template v-slot:activator="{ on: sheet, attrs }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-icon v-bind="attrs" v-on="{ ...tooltip, ...sheet }">mdi-magnify</v-icon>
            </template>
            <span>Search</span>
          </v-tooltip>
        </template>
        <Search @closeSearchSheet="closeSearchSheet" @search="search"></Search>
      </v-bottom-sheet>

      <v-tooltip bottom v-if="admin">
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
import Search from "@/components/announcements/shared/Search.vue";
import Drawer from "@/components/utils/Drawer";

export default {
  name: "AnnouncementsAppBar",
  components: {
    Drawer,
    Search,
  },
  props: ["admin", "placeholderExists"],
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