<template>
  <v-app>
    <AppBar page-name="All Classes"></AppBar>
    <v-main>
      <v-container>
        <v-card>
          <v-card-title>
            <v-col cols="12" sm="3">
              <v-text-field label="Class Name" v-model="searchValues.className"></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field label="Subject" v-model="searchValues.subject"></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field label="Teacher Name" v-model="searchValues.teacherName"></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select label="Year"
                        :items="years"
                        v-model="searchValues.selectedYear"
                        item-text="text"
                        item-value="value"></v-select>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-row justify="center" v-if="loading">
              <v-progress-circular indeterminate size="70"></v-progress-circular>
            </v-row>
            <v-row v-else>
              <v-col cols="12" sm="6" md="4" v-for="(availableClass, index) in availableClasses"
                     :key="availableClass.hash">
                <ClassCard :available-class="availableClass" :index="index"></ClassCard>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <BottomPagination :length="totalClasses" :page.sync="options.page"></BottomPagination>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import ClassCard from "@/components/classes/shared/ClassCard";
import BottomPagination from "@/components/announcements/shared/BottomPagination";

export default {
  name: "AllClasses",
  components: {BottomPagination, ClassCard, AppBar},
  data() {
    return {
      availableClasses: [],
      totalClasses: 0,
      loading: false,
      searchValues: {
        className: '',
        subject: '',
        teacherName: '',
        selectedYear: 1,
      },
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      options: {
        sortBy: [],
        sortDesc: [],
        page: 1,
        itemsPerPage: 5,
      },
    }
  },
  watch: {
    searchValues: {
      handler() {
        this.getAllClasses()
      },
      deep: true
    }
  },
  methods: {
    getAllClasses() {
      this.loading = true
      api({
        method: "GET",
        url: "/classes/all",
        params: {
          sortBy: this.options.sortBy,
          sortDesc: this.options.sortDesc,
          page: this.options.page,
          itemsPerPage: this.options.itemsPerPage,
          subject: this.searchValues.subject,
          teacherName: this.searchValues.teacherName,
          className: this.searchValues.className,
          year: this.searchValues.selectedYear,
        }
      }).then(response => {
        this.availableClasses = response.data.classes
        this.totalClasses = response.data.total
      }).finally(() => {
        this.loading = false
      })
    }
  },
  mounted() {
    this.getAllClasses()
  }
}
</script>

<style scoped>

</style>