<template>
  <v-card>
    <v-card-title>
      Peding Students
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
    >
      <template v-slot:item.created_at="{ item }">{{ item.created_at.substring(0, 10) }}</template>
      <template v-slot:item.status="{ item }">
        <v-row>
          <v-radio-group v-model="item.status" row>
            <v-radio label="Admin" value="admin"></v-radio>
            <v-radio label="Student" value="student"></v-radio>
            <v-radio label="Decline" value="decline"></v-radio>
            <v-btn color="primary" @click="submitState(item.id)">Submit</v-btn>
          </v-radio-group>
        </v-row>
      </template>
      <template></template>
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
      row: null,
      headers: [
        { text: "Full Name", value: "full_name", width: "20%" },
        { text: "Username", value: "username", width: "15%" },
        { text: "Registered At", value: "created_at" },
        { text: "State", value: "status", sortable: false },
      ],
      searchByItems: [
        { text: "Username", value: "username" },
        { text: "Full Name", value: "full_name" },
      ],
      searchBy: {
        value: "",
        field: "username",
      },
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
      const { sortBy, sortDesc, page, itemsPerPage } = this.options;
      api({
        method: "GET",
        url: "/students",
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
          this.students = response.data.students;
          this.totalStudents = response.data.total;
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
    submitState(id) {
      let formData = new FormData();
      formData.append("id", id);
      api({
        method: "PUT",
        url: "/students",
        data: formData,
      })
        .then(() => {
          this.getStudents();
        })
        .catch((error) => {
          this.$store.dispatch("viewSnackbar", {
            text: error.response.data.message,
            color: "error",
          });
        });
    },
  },
};
</script>