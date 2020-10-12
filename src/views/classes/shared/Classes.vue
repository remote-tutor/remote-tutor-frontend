<template>
  <v-app>
    <AppBar page-name="Classes"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <v-tabs v-model="selection">
            <v-tab>Enrolled Classes</v-tab>
            <v-tab>All Classes (Enroll)</v-tab>
          </v-tabs>
        </v-row>

        <v-tabs-items v-model="selection">
          <v-tab-item>
            <v-card>
              <v-card-text v-if="userClasses.length > 0">
                <v-row justify="center" v-if="loading">
                  <v-progress-circular indeterminate size="70"></v-progress-circular>
                </v-row>
                <v-row v-else>
                  <v-col cols="12" sm="6" md="4" v-for="(studentClass, index) in userClasses" :key="studentClass.hash">
                    <ClassCard :student-class="studentClass" :index="index"></ClassCard>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-text v-else>
                You're not enrolled in any classes.
                <v-btn text @click="selection = 1">ENROLL NOW!</v-btn>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab-item>
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
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import ClassCard from "@/components/classes/shared/ClassCard";

export default {
  name: "Classes",
  data() {
    return {
      userClasses: [],
      availableClasses: [],
      totalClasses: 0,
      selection: 0,
      loading: false,
      options: {
        sortBy: [],
        sortDesc: [],
        page: 1,
        itemsPerPage: 5,
      },
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      searchValues: {
        className: '',
        subject: '',
        teacherName: '',
        selectedYear: 1,
      }
    }
  },
  components: {ClassCard, AppBar},
  watch: {
    selection(val) {
      if (val === 0)
        this.getEnrolledClasses()
      else if (val === 1)
        this.getAllClasses()
    },
    searchValues: {
      handler() {
        this.getAllClasses()
      },
      deep: true
    }
  },
  methods: {
    getEnrolledClasses() {
      this.loading = true
      api({
        method: "GET",
        url: "/classes",
      }).then(response => {
        this.userClasses = response.data.classes
        this.$store.dispatch('setUserClasses', response.data.classes)
        if (this.userClasses.length > 0)
          this.$store.dispatch('setUserClass', 0)
      }).finally(() => {
        this.loading = false
      })
    },
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
    this.getEnrolledClasses()
  }
}
</script>

<style scoped>

</style>