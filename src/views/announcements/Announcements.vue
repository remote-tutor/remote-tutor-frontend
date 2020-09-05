<template>
  <v-app>
    <AnnouncementsAppBar
      :placeholderExists="placeholderExists"
      @createPlaceholder="createPlaceholder"
      @search="filterAnnouncements"
    ></AnnouncementsAppBar>
    <v-main>
      <v-container>
        <Announcement
          v-for="announcement in announcements"
          :key="announcement.id"
          :announcement="announcement"
          :placeholder-exists.sync="placeholderExists"
          @deleteAnnouncement="deleteAnnouncement"
          @updateAnnouncements="updateAnnouncements"
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
      this.announcements.unshift({ isNew: true, id: 0 });
    },
    deleteAnnouncement(options) {
      let index = this.announcements.indexOf(options)
      if (index === 0)
        this.placeholderExists = false
      this.announcements.splice(index, 1)
    },
    updateAnnouncements(options) {
      let oldAnnouncement = options.old
      let updatedAnnouncement = options.updated
      let index = this.announcements.indexOf(oldAnnouncement)
      this.announcements[index] = updatedAnnouncement
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
