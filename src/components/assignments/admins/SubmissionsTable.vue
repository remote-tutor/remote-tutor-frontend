<template>
  <v-card>
    <v-card-title>
      Submissions
      <v-spacer></v-spacer>
      <v-text-field
          v-model="searchBy"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          clearable
          @input="search"
      ></v-text-field>
    </v-card-title>
    <v-data-table
        :headers="headers"
        :items="submissions"
        :options.sync="options"
        :server-items-length="totalSubmissions"
        :loading="loading"
        :footer-props="{
        'items-per-page-options': [10, 15, 20]
      }"
        :items-per-page="10"
        must-sort
        sort-by="graded"
    >

      <template v-slot:item.fullName="{ item }">
        {{ item.user.fullName }}
      </template>
      <template v-slot:item.uploadedAt="{ item }">
        {{ item.uploadedAt | moment }}
      </template>
      <template v-slot:item.inTime="{ item }">
        <v-icon v-if="momentDifference(deadline, item.uploadedAt)">mdi-thumb-up</v-icon>
        <v-icon v-else>mdi-clipboard-alert</v-icon>
      </template>
      <template v-slot:item.download="{ item }">
        <v-btn x-small fab @click="downloadSubmissionFile(submissions.indexOf(item))"
               :loading="downloadSubmissions[submissions.indexOf(item)].loading">
          <a :href="downloadSubmissions[submissions.indexOf(item)].downloadLink"
             :download="downloadSubmissions[submissions.indexOf(item)].fileName"
             :id="'index-' + submissions.indexOf(item) + '-link'"
             class="download-link">

          </a>
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.graded="{ item }">
        <div v-if="item.graded">
          <v-icon>mdi-check-bold</v-icon>
        </div>
        <div v-else>
          <v-icon>mdi-close-circle</v-icon>
        </div>
      </template>

    </v-data-table>
  </v-card>

</template>

<script>
import api from "@/gateways/api";
import moment from "moment";

export default {
  name: "SubmissionsTable",
  props: ['deadline'],
  data() {
    return {
      totalSubmissions: 0,
      submissions: [],
      downloadSubmissions: [],
      loading: false,
      options: {},
      headers: [
        {text: 'Full Name', value: 'fullName'},
        {text: 'Uploaded At', value: 'uploadedAt'},
        {text: 'In Time', value: 'inTime', sortable: false},
        {text: 'Submission', value: 'download', sortable: false},
        {text: 'Mark', value: 'mark'},
        {text: 'Graded', value: 'graded'}
      ],
      searchBy: "",
    }
  },
  mounted() {
    this.getSubmissions()
  },
  watch: {
    options: {
      handler() {
        this.getSubmissions();
      },
      deep: true,
    },
  },
  methods: {
    search() {
      this.options.page = 1;
      this.getSubmissions()
    },
    getSubmissions() {
      this.loading = true
      this.submissions = []
      this.downloadSubmissions = []
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        modifiedSortBy.push(sortBy[i].replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))
      }
      api({
        method: "GET",
        url: "/admin/assignments/submissions",
        params: {
          assignmentID: this.$route.params.assignmentID,
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: modifiedSortBy,
          sortDesc: sortDesc,
          searchBy: this.searchBy
        }
      }).then(response => {
        this.totalSubmissions = response.data.totalSubmissions
        this.submissions = response.data.submissions
        this.submissions.forEach(submission => {
          this.downloadSubmissions.push({
            fullPath: submission.file,
            loading: false,
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getSubmissionFile(index) {
      this.downloadSubmissions[index].loading = true
      return api({
        method: "GET",
        url: "/assignments/assignment/file",
        responseType: 'blob',
        params: {
          file: this.downloadSubmissions[index].fullPath
        }
      }).then(response => {
        let folders = this.downloadSubmissions[index].fullPath.split("/")
        this.downloadSubmissions[index].fileName = folders[folders.length - 1]
        this.downloadSubmissions[index].downloadLink = URL.createObjectURL(new Blob([response.data]));
      }).catch((error) => {
        console.log(error)
        this.$store.dispatch('viewSnackbar', {
          text: 'Sorry we cannot download the requested file now, please try again later',
          color: 'error'
        })
      }).finally(() => {
        this.downloadSubmissions[index].loading = false
      })
    },
    downloadSubmissionFile(index) {
      if (this.downloadSubmissions[index].fileName === undefined) {
        this.getSubmissionFile(index).then(() => {
          document.getElementById('index-' + index + '-link').click()
        })
      }
    },
    momentDifference(deadline, uploadedAt) {
      deadline = moment(deadline)
      uploadedAt = moment(uploadedAt)
      let diff = deadline.diff(uploadedAt, 'minutes');
      return diff >= 0;
    }
  },

  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  },
}
</script>

<style scoped>

</style>