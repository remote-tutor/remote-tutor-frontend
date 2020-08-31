<template>
  <v-app>
    <AnnouncementsAppBar
      :admin="admin"
      :placeholderExists="placeholderExists"
      @createPlaceholder="createPlaceholder"
      @search="filterAnnouncements"
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
          :staticCreatedAt="announcement.created_at.substring(0, 10)"
          :id="announcement.id"
          :isNew="announcement.isNew"
          :admin="admin"
          @deleteAnnouncement="deleteAnnouncement"
        ></Announcement>
        <BottomPagination :length="totalPages" @pageChanged="pageChanged"></BottomPagination>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Announcement from "@/components/announcements/shared/Announcement.vue";
import AnnouncementsAppBar from "@/components/announcements/shared/AppBar.vue";
import BottomPagination from "@/components/announcements/shared/BottomPagination.vue";
import api from "@/gateways/api.js";

export default {
  name: "Announcements",
  components: {
    AnnouncementsAppBar,
    Announcement,
    BottomPagination,
  },
  data() {
    return {
      announcements: [],
      admin: true,
      placeholderExists: false,
      currentPage: 1,
      length: 5,
      totalPages: 1,
      searchValues: {
        title: "",
        topic: "",
        content: "",
      },
    };
  },
  methods: {
    getAnnouncements() {
      api({
        method: "GET",
        url: "/announcements",
        params: {
          length: this.length,
          currentPage: this.currentPage,
          title: this.searchValues.title,
          topic: this.searchValues.topic,
          content: this.searchValues.content,
        },
      })
        .then((response) => {
          this.announcements = response.data.announcements;
          let totalAnnouncements = response.data.total;
          this.totalPages = Math.ceil(totalAnnouncements / this.length);
        })
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
    filterAnnouncements(options) {
      this.announcements = [];
      this.searchValues = Object.assign({}, options.searchValues);
      this.getAnnouncements();
    },
    pageChanged(options) {
      this.currentPage = options.currentPage;
      this.getAnnouncements();
    },
  },
  mounted() {
    this.getAnnouncements();
  },
};
</script>
