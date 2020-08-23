<template>
  <v-app>
    <AnnouncementsAppBar
      :admin="admin"
      @createPlaceholder="createPlaceholder"
      @placeholderAlreadyExists="notifyUser"
    ></AnnouncementsAppBar>
    <v-main>
      <v-container>
        <Snackbar
          :visible="snackbarSettings.visible"
          :text="snackbarSettings.text"
          :color="snackbarSettings.color"
        ></Snackbar>
        <Announcement
          v-for="announcement in announcements"
          :key="announcement.Id"
          :staticTitle="announcement.Title"
          :staticTopic="announcement.Topic"
          :staticContent="announcement.Content"
          :id="announcement.Id"
          :admin="admin"
          @responseReturned="responseReturned"
        ></Announcement>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Announcement from "@/components/announcements/Announcement.vue";
import AnnouncementsAppBar from "@/components/announcements/AppBar.vue";
import Snackbar from "@/components/shared/Snackbar.vue";
import axios from "axios";

export default {
  name: "Announcements",
  components: {
    AnnouncementsAppBar,
    Snackbar,
    Announcement,
  },
  data() {
    return {
      announcements: [],
      admin: true,
      snackbarSettings: {
        visible: false,
        text: "",
        color: "",
      },
    };
  },
  methods: {
    getAnnouncements() {
      axios({
        method: "GET",
        url: "//localhost:3000/announcements",
        params: {
          start: this.announcements.length,
        },
      }).then((response) => {
        this.announcements = this.announcements.concat(
          response.data.announcements
        );
      });
    },
    responseReturned(snackbarSettings) {
      this.snackbarSettings.text = snackbarSettings.message;
      this.snackbarSettings.color = snackbarSettings.color;
      console.log("Visibility", this.snackbarSettings.visible)
      this.snackbarSettings.visible = true;
    },
    createPlaceholder() {
      this.announcements.unshift({
        Title: "",
        Topic: "",
        Content: "",
      });
    },
    notifyUser() {
      this.snackbarSettings.text = "Please fill the unfinished one first";
      this.snackbarSettings.color = "error";
      this.snackbarSettings.visible = true;
    },
  },
  created() {
    this.getAnnouncements();
  },
};
</script>
