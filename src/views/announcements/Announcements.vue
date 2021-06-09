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
        <BottomPagination :length="totalPages" :page.sync="options.page"></BottomPagination>

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


        <v-btn fixed dark fab right bottom color="primary" @click="sheet = true" v-else-if="isLoggedIn">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <!-- to add extra space for the FAB if the user scrolled to the bottom of the page-->
        <div style="height: 10px;"></div>

        <v-bottom-sheet v-model="sheet" inset v-if="isLoggedIn">
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
import static_announcements from '@/static-data/announcements.json'

export default {
  name: "Announcements",
  components: {
    AppBar,
    Announcement,
    BottomPagination,
    Search
  },
  computed: {
    ...mapState(['userData', 'classes', 'isLoggedIn']),
    selectedClass() {
      if(this.isLoggedIn)
        return this.classes.values[this.classes.selectedClass].classHash
      else
        return ""
    }
  },
  watch: {
    options: {
      handler() {
        this.getAnnouncements()
      },
      deep: true
    },
    selectedClass() {
      this.options = {
        sortBy: ['created_at'],
        sortDesc: ['true'],
        page: 1,
        itemsPerPage: 5,
      }
      this.getAnnouncements()
    },
  },
  data() {
    return {
      fab: false,
      sheet: false,
      announcements: [],
      placeholderExists: false,
      totalPages: 1,
      searchValues: {
        title: "",
        topic: "",
        content: "",
      },
      options: {
        sortBy: ['created_at'],
        sortDesc: ['true'],
        page: 1,
        itemsPerPage: 5,
      }
    };
  },
  methods: {
    getAnnouncements() {
      if(this.isLoggedIn) {
        api({
          method: "GET",
          url: "/announcements",
          params: {
            itemsPerPage: this.options.itemsPerPage,
            page: this.options.page,
            sortBy: this.options.sortBy,
            sortDesc: this.options.sortDesc,
            title: this.searchValues.title,
            topic: this.searchValues.topic,
            content: this.searchValues.content,
          },
        })
            .then((response) => {
              this.announcements = response.data.announcements;
              let totalAnnouncements = response.data.total;
              this.totalPages = Math.ceil(totalAnnouncements / this.options.itemsPerPage);
            })
      } else {
        this.announcements = static_announcements
      }
    },
    createPlaceholder() {
      if (this.placeholderExists) {
        this.$store.dispatch('viewErrorSnackbar', 'Please fill the unfinished one first')
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
      if (updatedAnnouncement.classHash === this.selectedClass) {
        this.announcements[index] = updatedAnnouncement
      } else {
        this.announcements.splice(index, 1)
      }
    },
    filterAnnouncements(options) {
      this.announcements = [];
      this.searchValues = Object.assign({}, options.searchValues);
      this.getAnnouncements();
    },
  },
  mounted() {
    this.getAnnouncements();
  },
};
</script>
