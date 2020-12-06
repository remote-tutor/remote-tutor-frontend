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
          @input="search"
      ></v-text-field>
    </v-card-title>
    <v-row>
      <v-col cols="12" md="3">
        <v-date-picker
            v-model="date"
            full-width
            :allowed-dates="allowedDates"
        ></v-date-picker>
        <v-btn block rounded color="primary" @click="confirmationTable = true">Save</v-btn>
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
        'items-per-page-options': [10, 15, 20, -1],
        'show-current-page': true,
        'show-first-last-page': true,
      }"
            :items-per-page="10"
            class="elevation-1"
            show-select
            item-key="user.username"
            @item-selected="itemSelected"
            @toggle-select-all="toggleSelectAll"
        ></v-data-table>
      </v-col>
    </v-row>
    <ConfirmationTable :dialog.sync="confirmationTable" :added-to="accessChanges.addedTo"
                       :removed-from="accessChanges.removedFrom" :date="date"
                       @saved="savedSuccessfully"
    ></ConfirmationTable>
  </v-card>
</template>

<script>
import api from "@/gateways/api";
import {mapState} from "vuex";
import ConfirmationTable from "@/components/payments/admins/ConfirmationTable";

export default {
  name: "StudentsTable",
  components: {ConfirmationTable},
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
      accessChanges: {
        addedTo: [],
        removedFrom: [],
      },
      retrievedAccessUsersIDs: new Set(), // set to hold the IDs of the users who's access has been retrieved before
      confirmationTable: false,
    }
  },
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },
  methods: {
    search() {
      this.options.page = 1;
      this.getStudents();
    },
    savedSuccessfully() {
      this.accessChanges.addedTo = []
      this.accessChanges.removedFrom = []
    },
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
          searchByValue: this.searchBy,
          studentsOnly: true, // to avoid retrieving the admins users
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
      let usersIDs = this.students.filter(student => {
        if (!this.retrievedAccessUsersIDs.has(student.userID)) {
          this.retrievedAccessUsersIDs.add(student.userID)
          return student
        }
      }).map(student => student.userID)
      if (usersIDs.length > 0) {
        api({
          method: "GET",
          url: '/admin/payments/week',
          params: {
            date: new Date(this.date).getTime(),
            usersIDs: usersIDs,
          },
        }).then(response => {
          let access = response.data.payments
          access.forEach(payment => {
            this.students.forEach(student => {
              if (student.userID === payment.userID)
                this.selected.push(student)
            })
          })
        }).finally(() => {
          this.loading = false
        })
      }

    },
    updatePayments() {
    },
    itemSelected(item) {
      if (item.value) {  // row is selected
        let removedUser = this.isUserInArray(this.accessChanges.removedFrom, item.item.userID) // get the index of the item
        let isSelected = this.isUserInArray(this.selected, item.item.userID)
        if (removedUser.found) { // item was removed (so there's no point adding it -  just deleting it from the removedFrom array is enough)
          this.accessChanges.removedFrom.splice(removedUser.index, 1)
        } else { // item is not in the removedFrom array (we want to add access to new user)
          if (!isSelected.found) // if the item is already selected, then do nothing (would trigger from the selectAll button)
            this.accessChanges.addedTo.push(item.item) // item is newly added
        }
      } else { // row is deselected
        let addedUser = this.isUserInArray(this.accessChanges.addedTo, item.item.userID) // get the index of the item
        let isSelected = this.isUserInArray(this.selected, item.item.userID)
        if (addedUser.found) { // item was added (so there's no point removing it - just deleting it from the addedTo array)
          this.accessChanges.addedTo.splice(addedUser.index, 1)
        } else { // item is not in the addedTo array ( we want to remove access from user-with-existing-access)
          if (isSelected.found) { // if the item is selected, then add it to the removedFrom
            // while if it's not selected, then do nothing
            this.accessChanges.removedFrom.push(item.item) // item is newly removed
          }
        }
      }
    },
    isUserInArray(arr, userID) {
      let found = false
      let index = -1
      arr.forEach((student, i) => {
        if (student.userID === userID) {
          found = true
          index = i
        }
      })
      return {found: found, index: index}
    },
    toggleSelectAll(items) {
      items.items.forEach(item => {
        this.itemSelected({item: item, value: items.value})
      })
    },
    allowedDates: val => new Date(val).getDay() === 5,
  },
  mounted() {
    this.getStudents()
    let currentDate = new Date()
    while (currentDate.getDay() !== 5) {
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
      this.selected = []
      this.accessChanges.addedTo = []
      this.accessChanges.removedFrom = []
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