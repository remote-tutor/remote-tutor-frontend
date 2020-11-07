<template>
  <v-data-table
      :headers="headers"
      :items="assignments"
      class="elevation-1"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalAssignments"
      :footer-props="{
        'items-per-page-options': [10, 15, 20],
        'show-current-page': true,
        'show-first-last-page': true,
      }"
      :items-per-page="10"
      must-sort
      sort-by="CreatedAt"
      sort-desc
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>
          Assignments
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-col md="3">
          <v-btn v-if="userData.admin"
                 color="primary"
                 dark
                 @click="view({hash: -1})"
                 class="mb-2">Create Assignment
          </v-btn>
        </v-col>
      </v-toolbar>
    </template>

    <template v-slot:item.CreatedAt="{item}">
      {{ item.CreatedAt.substr(0, 10) }}
    </template>

    <template v-slot:item.deadline="{item}">
      {{ item.deadline.substr(0, 10) }}
    </template>

    <template v-slot:item.view="{item}">
      <v-btn small v-if="item.access || userData.admin" @click="view(item)">View</v-btn>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>You don't have access to view this assignment. If you think there's an error, please contact the administrator</span>
      </v-tooltip>
    </template>


  </v-data-table>
</template>

<script>
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "AssignmentsTable",
  data() {
    return {
      loading: false,
      options: {},
      headers: [
        {text: 'Title', value: 'title', sortable: false},
        {text: 'Created At', value: 'CreatedAt'},
        {text: 'Deadline', value: 'deadline'},
        {text: 'View', value: 'view', sortable: false},

      ],
      assignments: [],
      totalAssignments: 0,
    }
  },
  mounted() {
    this.getAssignments()
  },
  computed: {
    ...mapState(['userData', 'classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    },
  },
  methods: {
    getAssignments() {
      this.loading = true
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        if (sortBy[i] === 'CreatedAt')
          modifiedSortBy.push('created_at')
        else
          modifiedSortBy.push(sortBy[i].replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))
      }

      api({
        method: "GET",
        url: "/assignments",
        params: {
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: modifiedSortBy,
          sortDesc: sortDesc,
        }
      }).then(async response => {
        this.totalAssignments = response.data.totalAssignments
        this.assignments = response.data.assignments

        let assignmentsPermissions = []
        this.assignments.forEach(assignment => {
          assignmentsPermissions.push(this.getAssignmentPermission(assignment))
        })
        await Promise.all(assignmentsPermissions).then(response => {
          this.assignments.forEach((assignment, index) => {
            this.assignments[index].access = response[index].data.status
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getAssignmentPermission(assignment) {
      return api({
        method: "GET",
        url: "/payments/week",
        params: {
          eventDate: new Date(assignment.CreatedAt).getTime()
        }
      })
    },
    view(assignment) {
      console.log(assignment)
      this.$router.push({name: 'Assignment', params: {assignmentHash: assignment.hash}})
    }
  },
  watch: {
    options: {
      handler() {
        this.getAssignments();
      },
      deep: true,
    },
    selectedClass() {
      this.options.page = 1
      this.getAssignments()
    },
  },
}
</script>

<style scoped>

</style>