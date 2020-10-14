<template>
  <v-app>
    <AppBar page-name="Class"></AppBar>
    <v-main>
      <v-container>
        <v-card>
          <v-card-title>
            Admins For: {{ classValue.name }}
            <v-spacer></v-spacer>
            Subject: {{ classValue.organization.subject }}
            <v-spacer></v-spacer>
            Taught By Mr. {{ classValue.organization.teacherName }}
          </v-card-title>
          <v-card-text>

            <v-row>
              <v-col cols="12" sm="8">
                <v-autocomplete
                    label="Add New Admin(s)" chips clearable rounded solo dense item-value="user.ID"
                    :items="students" v-model="newAdmin" :search-input.sync="search" item-text="user.fullName"
                >
                  <template v-slot:append-item>
                    <v-list-item v-if="loadingStudents">
                      <v-progress-circular indeterminate></v-progress-circular>
                    </v-list-item>
                    <v-list-item v-else-if="noMoreStudents" disabled>
                      No More Students, Change Search Value
                    </v-list-item>
                    <v-list-item @click="getStudents(true)" v-else>
                      Load More...
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn block color="primary" @click="addAdminToOrganization">Add Admin to Organization</v-btn>
              </v-col>
            </v-row>

            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="admins"
                :loading="loading"
                show-select
                item-key="user.username"
                :footer-props="{
                  'items-per-page-options': [-1],
                  'show-current-page': true,
                }"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "Class",
  components: {AppBar},
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },
  data() {
    return {
      headers: [
        {text: "Full Name", value: "user.fullName"},
        {text: "Username", value: "user.username"},
      ],
      admins: [],
      selected: [],
      newAdmin: 0,
      students: [],
      studentsPage: 1,
      search: '',
      loading: false,
      classValue: {
        organization: {}
      },
      loadingStudents: false,
      noMoreStudents: false,
    }
  },
  methods: {
    getAdmins() {
      this.loading = true
      api({
        method: 'GET',
        url: '/admin/classes/admins',
      }).then(response => {
        this.admins = response.data.admins
      }).finally(() => {
        this.loading = false
      })
    },
    getClass() {
      api({
        method: 'GET',
        url: '/classes/class'
      }).then(response => {
        this.classValue = response.data.class
      })
    },
    getStudents(append) {
      this.noMoreStudents = false
      this.loadingStudents = true
      if (append)
        this.studentsPage++
      else
        this.studentsPage = 1
      api({
        method: 'GET',
        url: '/admin/classes/students',
        params: {
          page: this.studentsPage,
          itemsPerPage: 10,
          sortBy: [],
          sortDesc: [],
          searchByField: 'fullName',
          searchByValue: this.search
        }
      }).then(response => {
        if (append)
          this.students = this.students.concat(response.data.students)
        else
          this.students = response.data.students
        if (response.data.students.length < 10)
          this.noMoreStudents = true
      }).finally(() => {
        this.loadingStudents = false
      })
    },
    addAdminToOrganization() {
      let formData = new FormData()
      formData.append("userID", this.newAdmin)
      formData.append("selectedClass", this.selectedClass)
      api({
        method: 'POST',
        url: '/admin/classes/admins',
        data: formData
      }).then(() => {
        this.getAdmins()
        this.newAdmin = 0
      })
    }
  },
  watch: {
    selectedClass(val) {
      this.$router.replace({name: 'Class', params: {classHash: val}})
      this.getClass()
      this.getAdmins()
    },
    search() {
      this.getStudents()
    }
  },
  mounted() {
    this.getClass()
    this.getAdmins()
    this.getStudents()
  }
}
</script>

<style scoped>

</style>