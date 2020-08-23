<template>
  <div>
    <v-app-bar color="black" dense dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>Announcements</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn>
            <v-icon v-bind="attrs" v-on="on">mdi-magnify</v-icon>
          </v-btn>
        </template>
        <span>Search</span>
      </v-tooltip>

      <v-tooltip bottom v-if="admin">
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="createPlaceholder">
            <v-icon v-bind="attrs" v-on="on">mdi-plus-circle</v-icon>
          </v-btn>
        </template>
        <span>Create</span>
      </v-tooltip>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: "AnnouncementsAppBar",
  props: ["admin"],
  data() {
    return {
      placeholderExists: false,
    };
  },
  methods: {
    createPlaceholder() {
      if (this.placeholderExists) {
        this.$store.dispatch("viewScnackbar", {
          text: "Please fill the unfinished one first",
          color: "error",
        });
      } else {
        this.placeholderExists = true;
        this.$emit("createPlaceholder");
      }
    },
  },
};
</script>