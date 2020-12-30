<template>
  <v-card>
    <v-card-title>
      {{ tableTitle }}
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
    <v-data-table
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
    >
      <template v-slot:footer v-if="pending">
        <v-btn block color="primary" @click="sendState">Submit</v-btn>
      </template>

      <template v-slot:item.CreatedAt="{ item }">{{ item.CreatedAt.substring(0, 10) }}</template>
      <template v-slot:item.status="{ item }" v-if="pending">
        <v-row>
          <v-radio-group v-model="item.status" row @change="(item.status === 'false') ? item.admin = false : ()=>{} ">
            <v-radio label="Accept" value="true"></v-radio>
            <v-radio label="Decline" value="false"></v-radio>
          </v-radio-group>
        </v-row>
      </template>
      <template v-slot:item.pendingAdmin="{ item }">
        <v-simple-checkbox v-model="item.admin" :ripple="false"
                           :disabled="(!item.status || item.status === 'false')"></v-simple-checkbox>
      </template>
      <template v-slot:item.payments="{ item }">
        <v-tooltip bottom v-if="item.admin">
          <template v-slot:activator="{ on }">
            <v-btn small fab text v-on="on" class="btn-admin-payment">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
          </template>
          <span>There's no payments for admin users</span>
        </v-tooltip>
        <v-btn small fab text @click="viewPayments(item)" v-else>
          <v-icon>mdi-cash</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.admin="{ item }">
        <v-row>
          <v-simple-checkbox v-model="item.admin" :ripple="false" disabled></v-simple-checkbox>
          <ConfirmationDialog
              buttonText="Change Status"
              :mainText="(item.admin) ? 'Convert this ADMIN to STUDENT ?' :
               'Are you sure you want to convert this user to an admin ?'"
              :message="(item.admin) ? 'This user won\'t be able to create announcement, quiz, video, etc...' :
               'This user will have admin privileges to create, edit, and delete components for this class'"
              @confirm="changeAdminStatus(item)"
              admin-status></ConfirmationDialog>
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
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import {initializeMonthWeeks} from "@/components/payments/weeks/weeks";

export default {
  name: "StudentsTable",
  components: {ConfirmationDialog, Payment},
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
      searchBy: "",
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
      date: new Date().toISOString().substr(0, 7),
      menu: false,
      weeks: [],
      selectedWeek: {}
    };
  },
  mounted() {
    this.getStudents();
    if (this.pending) {
      this.headers.push({text: "State", value: "status", sortable: false},)
      this.headers.push({text: "Admin", value: "pendingAdmin", sortable: false},)
      this.tableTitle = 'Pending Students'
    } else {
      this.headers.push({text: "Payments", value: "payments", sortable: false})
      this.headers.push({text: "Admin", value: "admin"})
      this.weeks = initializeMonthWeeks(this.date)
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
      this.students = []
      this.loading = true;
      const {sortBy, sortDesc, page, itemsPerPage} = this.options;
      let modifiedSortBy = []
      for (let i = 0; i < sortBy.length; i++) {
        if (sortBy[i] === 'CreatedAt')
          modifiedSortBy.push('created_at')
        else if (sortBy[i] === 'admin')
          modifiedSortBy.push('admin')
        else {
          let columnName = sortBy[i].split(".")[1]
          modifiedSortBy.push(columnName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`))
        }

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
        },
      })
          .then((response) => {
            this.students = response.data.students;
            this.totalStudents = response.data.totalStudents;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    search() {
      this.options.page = 1;
      this.getStudents();
    },
    sendState() {
      let studentsToUpdate = []
      this.loading = true
      for (let i = 0; i < this.students.length; i++) {
        if (this.students[i].status !== undefined)
          studentsToUpdate.push(this.updateClassUser(this.students[i]))
      }
      Promise.all(studentsToUpdate).then(() => {
        this.getStudents()
      }).finally(() => {
        this.loading = false
      })
    },
    updateClassUser(classUser) {
      let formData = new FormData()
      formData.append("classUserID", classUser.ID);
      (this.pending) ?
          formData.append("status", classUser.status) :
          formData.append("status", true)
      formData.append("admin", classUser.admin)
      return api({
        method: "PUT",
        url: "/admin/classes/students",
        data: formData,
      })
    },
    changeAdminStatus(classUser) {
      classUser.admin = !classUser.admin
      this.updateClassUser(classUser)
    },
    viewPayments(user) {
      if (this.pending)
        return
      if (user.admin) {
        this.$store.dispatch('viewErrorSnackbar', 'This user is an admin, you can\'t view admin payments')
        return
      }
      this.payment.dialog = true
      this.payment.studentName = user.user.fullName
      this.payment.userID = user.user.ID
    },
    saveMonth() {
      this.$refs.menu.save(this.date)
      this.weeks = initializeMonthWeeks(this.date)
    },
  },
};
</script>

<style scoped>
.btn-admin-payment {
  cursor: not-allowed;
}
</style>