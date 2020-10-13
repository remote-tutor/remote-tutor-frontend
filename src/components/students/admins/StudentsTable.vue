<template>
  <v-card>
    <v-card-title>
      {{tableTitle}}
      <v-spacer></v-spacer>
      <v-text-field
          v-model="searchBy.value"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          clearable
          @input="search"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-select :items="searchByItems" v-model="searchBy.field" label="Search By" @input="search"></v-select>
    </v-card-title>
    <v-data-table
        :headers="headers"
        :items="students"
        :options.sync="options"
        :server-items-length="totalStudents"
        :loading="loading"
        :footer-props="{
        'items-per-page-options': [10, 15, 20]
      }"
        :items-per-page="10"
        class="elevation-1"
        @click:row="handleClick"
    >
      <template v-slot:footer v-if="pending">
        <v-btn block color="primary" @click="submitState">Submit</v-btn>
      </template>

      <template v-slot:item.CreatedAt="{ item }">{{ item.CreatedAt.substring(0, 10) }}</template>
      <template v-slot:item.status="{ item }" v-if="pending">
        <v-row>
          <v-radio-group v-model="item.status" row>
            <v-radio label="Accept" value="true"></v-radio>
            <v-radio label="Decline" value="false"></v-radio>
          </v-radio-group>
        </v-row>
      </template>
    </v-data-table>

    <Payment v-if="!pending"
              :dialog.sync="payment.dialog"
              :student-name="payment.studentName"
              :userID="payment.userID"
    ></Payment>

  </v-card>
</template>

<script>
import api from "@/gateways/api.js";
import Payment from "@/components/payments/shared/Payment";
import {mapState} from "vuex";

export default {
  name: "StudentsTable",
  components: {Payment},
  props: ["pending"],
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },
  data() {
    return {
      totalStudents: 0,
      students: [],
      loading: false,
      options: {},
      tableTitle: 'Active Students',
      headers: [
        {text: "Full Name", value: "user.fullName"},
        {text: "Username", value: "user.username"},
        {text: "Phone Number", value: "user.phoneNumber", sortable: false},
        {text: "Parent Number", value: "user.parentNumber", sortable: false},
        {text: "Registered At", value: "CreatedAt"},
      ],
      searchByItems: [
        {text: "Username", value: "username"},
        {text: "Full Name", value: "fullName"},
      ],
      searchBy: {
        value: "",
        field: "username",
      },
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      payment: {
        dialog: false,
        studentName: '',
        userID: 0,
      },

    };
  },
  mounted() {
    this.getStudents();
    if (this.pending) {
      this.headers.push({text: "State", value: "status", sortable: false},)
      this.tableTitle = 'Pending Students'
    }
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
  },
  methods: {
    getStudents() {
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options;
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        if (sortBy[i] === 'CreatedAt')
          modifiedSortBy.push('created_at')
        else
          modifiedSortBy.push(sortBy[i].replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))

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
          searchByField: this.searchBy.field,
        },
      })
          .then((response) => {
            this.students = response.data.students;
            this.totalStudents = response.data.totalStudents;
          })
          .catch((error) => {
            this.$store.dispatch("viewSnackbar", {
              text: error.response.data.message,
              color: "error",
            });
          })
          .finally(() => {
            this.loading = false;
          });
    },
    search() {
      this.options.page = 1;
      this.getStudents();
    },
    submitState() {
      this.loading = true
      this.sendState().then(() => {
        this.students = []
        this.getStudents()
      })

    },
    async sendState() {
      for (let i = 0; i < this.students.length; i++) {
        if (this.students[i].status === undefined)
          continue
        let formData = new FormData()
        formData.append("classUserID", this.students[i].ID)
        formData.append("status", this.students[i].status)
        await api({
          method: "PUT",
          url: "/admin/classes/students",
          data: formData,
        })
      }
    },
    handleClick(user) {
      if (this.pending)
        return
      if (user.admin) {
        this.$store.dispatch('viewSnackbar', {
          text: "This user is an admin, you can't view admin payments",
          color: "error",
        })
        return
      }
      this.payment.dialog = true
      this.payment.studentName = user.fullName
      this.payment.userID = user.ID
    }
  },
};
</script>