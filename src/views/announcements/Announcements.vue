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
          v-for="announcement in announcements"
          :key="announcement.Id"
          :staticTitle="announcement.Title"
          :staticTopic="announcement.Topic"
          :staticContent="announcement.Content"
          :id.sync="announcement.Id"
          :isNew="announcement.isNew"
          :admin="admin"
          @deleteNewAnnouncement="deleteNewAnnouncement"
          @placeholderFilled="placeholderFilled"
        ></Announcement>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Announcement from "@/components/announcements/Announcement.vue";
import AnnouncementsAppBar from "@/components/announcements/AppBar.vue";
import axios from "axios";

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
    createPlaceholder() {
      this.placeholderExists = true
      this.announcements.unshift({
        Id: 0,
        Title: "",
        Topic: "",
        Content: "",
        isNew: true,
      });
    },
    deleteNewAnnouncement() {
      this.announcements.shift()
      this.placeholderFilled();
    },
    placeholderFilled() {
      this.placeholderExists = false
    }
  },
  created() {
    this.getAnnouncements();
  },
};
</script>
