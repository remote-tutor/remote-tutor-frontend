<template>
  <v-card>
    <v-card-title>
      Pending Students
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
        disable-sort
        :footer-props="{
        'items-per-page-options': [10, 15, 20]
      }"
        :items-per-page="10"
        class="elevation-1"
    >
      <template v-slot:footer>
        <v-btn block color="primary" @click="submitState">Submit</v-btn>
      </template>

      <template v-slot:item.fullName="props">
        <v-edit-dialog
            :return-value.sync="props.item.fullName"
        > {{ props.item.fullName }}
          <template v-slot:input>
            <v-text-field
                v-model="props.item.fullName"
                label="Edit"
                single-line
                counter
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </template>

      <template v-slot:item.year="props">
        <v-edit-dialog persistent large :return-value.sync="props.item.year">
          <v-btn small fab elevation="3">
            {{ props.item.year }}
          </v-btn>
          <template v-slot:input>
            <v-select
                label="Year"
                :items="years"
                item-text="text"
                item-value="value"
                v-model="props.item.year"
            ></v-select>
          </template>

        </v-edit-dialog>
      </template>

      <template v-slot:item.phoneNumber="props">
        <v-edit-dialog :return-value.sync="props.item.phoneNumber">
          <v-btn text :color="props.item.phoneNumber.length !== 11 ? 'red': ''">{{ props.item.phoneNumber }}</v-btn>
          <template v-slot:input>
            <v-text-field
                v-model="props.item.phoneNumber"
                label="Edit"
                single-line
                counter
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </template>

      <template v-slot:item.parentNumber="props">
        <v-edit-dialog :return-value.sync="props.item.parentNumber">
          <v-btn text :color="props.item.parentNumber.length !== 11 ? 'red': ''">{{ props.item.parentNumber }}</v-btn>
          <template v-slot:input>
            <v-text-field
                v-model="props.item.parentNumber"
                label="Edit"
                single-line
                counter
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </template>

      <template v-slot:item.CreatedAt="{ item }">{{ item.CreatedAt.substring(0, 10) }}</template>
      <template v-slot:item.status="{ item }">
        <v-row>
          <v-radio-group v-model="item.status" row>
            <v-radio label="Admin" value="1"></v-radio>
            <v-radio label="Student" value="0"></v-radio>
            <v-radio label="Decline" value="-1"></v-radio>
          </v-radio-group>
        </v-row>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import api from "@/gateways/api.js";

export default {
  name: "StudentsTable",
  props: ["pending"],
  data() {
    return {
      totalStudents: 0,
      students: [],
      loading: false,
      options: {},
      headers: [
        {text: "Full Name", value: "fullName"},
        {text: "Username", value: "username"},
        {text: "Phone Number", value: "phoneNumber", sortable: false},
        {text: "Parent Number", value: "parentNumber", sortable: false},
        {text: "Year", value: "year"},
        {text: "Registered At", value: "CreatedAt"},
        {text: "State", value: "status", sortable: false},
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
    };
  },
  mounted() {
    this.options.sortBy.push("created_at");
    this.options.sortDesc.push("true");
    this.getStudents();
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
      api({
        method: "GET",
        url: "/pending-students",
        params: {
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: sortBy,
          sortDesc: sortDesc,
          pending: this.pending,
          searchByValue: this.searchBy.value,
          searchByField: this.searchBy.field,
        },
      })
          .then((response) => {
            this.students = response.data.pendingStudents;
            this.totalStudents = response.data.totalPendingStudents;
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
        formData.append("userID", this.students[i].ID)
        formData.append("fullName", this.students[i].fullName)
        formData.append("status", this.students[i].status)
        formData.append("year", this.students[i].year)
        formData.append("phoneNumber", this.students[i].phoneNumber)
        formData.append("parentNumber", this.students[i].parentNumber)
        await api({
          method: "PUT",
          url: "/students",
          data: formData,
        })
      }
    }
  },
};
</script>