<template>
  <v-app>
    <AppBar page-name="Announcements"></AppBar>
    <v-main>
      <v-container>
        <Announcement
          v-for="announcement in announcements"
          :key="announcement.ID"
          :announcement="announcement"
          :placeholder-exists.sync="placeholderExists"
          @deleteAnnouncement="deleteAnnouncement"
          @updateAnnouncements="updateAnnouncements"
          ></Announcement>
        <BottomPagination :length="totalPages" @pageChanged="pageChanged"></BottomPagination>

        <v-speed-dial v-model="fab" fixed bottom right direction="top" v-if="userData.admin">
          <template v-slot:activator>
            <v-btn v-model="fab" color="blue darken-2" dark fab>
              <v-icon v-if="fab">mdi-close</v-icon>
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-btn>
          </template>

          <v-btn fab dark small color="green" @click="sheet = true">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn fab dark small color="indigo" @click="createPlaceholder">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-speed-dial>


        <v-btn fixed dark fab right bottom color="primary" @click="sheet = true" v-else>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- to add extra space for the FAB if the user scrolled to the bottom of the page-->
        <div style="height: 10px;"></div>

        <v-bottom-sheet v-model="sheet" inset>
          <Search @closeSearchSheet="sheet = false" @search="filterAnnouncements"></Search>
        </v-bottom-sheet>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Announcement from "@/components/announcements/shared/Announcement.vue";
import BottomPagination from "@/components/announcements/shared/BottomPagination.vue";
import Search from "@/components/announcements/shared/Search.vue";
import api from "@/gateways/api.js";
import {mapState} from "vuex";
import AppBar from "@/components/utils/AppBar";

export default {
  name: "Announcements",
  components: {
    AppBar,
    Announcement,
    BottomPagination,
    Search
  },
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      fab: false,
      sheet: false,
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
      if (this.placeholderExists) {
        this.$store.dispatch("viewSnackbar", {
          text: "Please fill the unfinished one first",
          color: "error",
        });
      } else {
        this.placeholderExists = true;
        this.announcements.unshift({ isNew: true, ID: 0 });
        this.$vuetify.goTo(0)
      }
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
