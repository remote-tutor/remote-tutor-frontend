<template>
  <v-app>
    <AnnouncementsAppBar
      :admin="admin"
      :placeholderExists="placeholderExists"
      @createPlaceholder="createPlaceholder"
    ></AnnouncementsAppBar>
    <v-main>
      <v-container>
        <Announcement
          v-if="placeholderExists"
          :isNew="true"
          @deleteNewAnnouncement="deleteNewAnnouncement"
          @placeholderFilled="placeholderFilled"
          :admin="admin"
        ></Announcement>
        <Announcement
          v-for="announcement in announcements"
          :key="announcement.id"
          :staticTitle="announcement.title"
          :staticTopic="announcement.topic"
          :staticContent="announcement.content"
          :id="announcement.id"
          :isNew="announcement.isNew"
          :admin="admin"
          @deleteAnnouncement="deleteAnnouncement"
        ></Announcement>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Announcement from "@/components/announcements/Announcement.vue";
import AnnouncementsAppBar from "@/components/announcements/AppBar.vue";
import api from "@/gateways/api.js";

export default {
  name: "Announcements",
  components: {
    AnnouncementsAppBar,
    Announcement,
  },
  data() {
    return {
      announcements: [],
      admin: true,
      placeholderExists: false,
    };
  },
  methods: {
    getAnnouncements() {
      api({
        method: "GET",
        url: "/announcements",
        params: {
          start: this.announcements.length,
        },
      })
        .then((response) => {
          this.announcements = this.announcements.concat(
            response.data.announcements
          );
        })
        .catch((error) => {
          this.$store.dispatch("viewSnackbar", {
            text: error.response.data.message,
            color: "error",
          });
        });
    },
    createPlaceholder() {
      this.placeholderExists = true;
    },
    deleteNewAnnouncement() {
      this.placeholderExists = false;
    },
    placeholderFilled(options) {
      this.placeholderExists = false;
      if (options.new) {
        this.announcements.unshift(options.announcementData);
      }
    },
    deleteAnnouncement(options) {
      for (let i = 0; i < this.announcements.length; i++) {
        if (this.announcements[i].id === options.id) {
          this.announcements.splice(i, 1);
        }
      }
    },
  },
  created() {
    this.getAnnouncements();
  },
};
</script>
