<template>
  <v-card>
    <v-card-title>
      Students
      <v-spacer></v-spacer>
      <v-text-field
          v-model="searchBy"
          append-icon="mdi-magnify"
          label="Search by Username, Full Name, or Phone Number"
          single-line
          clearable
      ></v-text-field>
    </v-card-title>
    <v-row>
      <v-col cols="12" md="3">
        <v-date-picker
            v-model="date"
            full-width
            :allowed-dates="allowedDates"
        ></v-date-picker>
        <v-btn block rounded color="primary" @click="updatePayments">Save</v-btn>
      </v-col>
      <v-col cols="12" md="9">
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
        ></v-data-table>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "StudentsTable",
  data() {
    return {
      searchBy: '',
      totalStudents: 0,
      students: [],
      selected: [],
      loading: false,
      options: {},
      headers: [
        {text: "Full Name", value: "user.fullName"},
        {text: "Username", value: "user.username"},
        {text: "Phone Number", value: "user.phoneNumber", sortable: false},
      ],
      date: '',
    }
  },
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },
  methods: {
    getStudents() {
      this.students = []
      this.totalStudents = 0
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options;
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        let columnName = sortBy[i].split(".")[1]
        modifiedSortBy.push(columnName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))
      }
      api({
        method: "GET",
        url: "/admin/classes/students",
        params: {
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: modifiedSortBy,
          sortDesc: sortDesc,
          pending: this.pending,
          searchByValue: this.searchBy.value,
        },
      })
          .then((response) => {
            this.students = response.data.students;
            this.totalStudents = response.data.totalStudents;
            this.getPayments()
          })
          .finally(() => {
            this.loading = false;
          })
    },
    getPayments() {
      this.loading = true
      this.selected = []
      api({
        method: "GET",
        url: '/admin/payments/week',
        params: {
          date: new Date(this.date).getTime(),
          usersIDs: this.students.map(student => student.userID),
        },
      }).then(response => {
        this.originalAccess = response.data.payments
        this.originalAccess.forEach(payment => {
          this.students.forEach(student => {
            if (payment.userID === student.userID)
              this.selected.push(student)
          })
        })
      }).finally(() => {
        this.loading = false
      })
    },
    updatePayments() {},
    allowedDates: val => new Date(val).getDay() === 5,
  },
  mounted() {
    this.getStudents()
    let currentDate = new Date()
    while(currentDate.getDay() !== 5) {
      currentDate.setDate(currentDate.getDate() - 1)
    }
    this.date = currentDate.toISOString().substr(0, 10)
  },
  watch: {
    options: {
      handler() {
        this.getStudents();
      },
      deep: true,
    },
    selectedClass() {
      this.options.page = 1
      this.getStudents()
    },
    date() {
      this.getPayments()
    }
  },
}
</script>

<style scoped>

</style>