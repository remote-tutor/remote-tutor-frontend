<template>
  <div>
    <v-card>
      <v-card-title>
        Manual Access
        <v-btn :loading="loading" icon>
          <v-icon @click="getStudents">mdi-reload</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="searchBy"
            label="Search by Username, Full Name, or Phone Number"
            clearable
            prepend-icon="mdi-magnify"
            @input="search"
        ></v-text-field>
      </v-card-title>
      <v-data-table
          v-model="selected"
          :headers="headers"
          :items="students"
          :options.sync="options"
          :server-items-length="totalStudents"
          :loading="loading"
          :footer-props="{
        'items-per-page-options': [10, 15, 20],
        'show-current-page': true,
        'show-first-last-page': true,
      }"
          :items-per-page="10"
          class="elevation-1"
          show-select
          item-key="user.username"
          must-sort
      ></v-data-table>
    </v-card>
  </div>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "VideoManualAccess",
  props: ['video'],
  data() {
    return {
      searchBy: '',
      totalStudents: 0,
      students: [],
      selected: [],
      loading: false,
      options: {
        sortBy: ['user.fullName'],
      },
      headers: [
        {text: "Full Name", value: "user.fullName", width: "40%"},
        {text: "Username", value: "user.username", width: "40%"},
        {text: "Phone Number", value: "user.phoneNumber", sortable: false, width: "20%"},
      ],
    }
  },
  mounted() {
    this.getStudents()
  },
  watch: {
    options: {
      handler() {
        this.getStudents();
      },
      deep: true,
    },
  },
  methods: {
    getStudents() {
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options;
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        let columnName = sortBy[i].split(".")[1]
        modifiedSortBy.push(columnName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))
      }
      api({
        method: "GET",
        url: "/admin/videos/video/manual",
        params: {
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: modifiedSortBy,
          sortDesc: sortDesc,
          pending: this.pending,
          searchByValue: this.searchBy,
          videoID: this.video.ID,
        },
      })
          .then((response) => {
            this.students = response.data.students;
            this.totalStudents = response.data.total;
          })
          .finally(() => {
            this.loading = false;
          })
    },
    search() {
      this.options.page = 1
      this.getStudents()
    },
  },
}
</script>

<style scoped>

</style>