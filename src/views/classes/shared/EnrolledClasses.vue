<template>
  <v-app>
    <AppBar page-name="Enrolled Classes"></AppBar>
    <v-main>
      <v-container>
        <v-card>
          <v-card-text>
            <v-row justify="center" v-if="loading">
              <v-progress-circular indeterminate size="70"></v-progress-circular>
            </v-row>
            <v-row v-else-if="!loading">
              <v-col cols="12" sm="6" md="4" v-for="(studentClass, index) in userClasses" :key="studentClass.hash">
                <ClassCard :student-class="studentClass" :index="index"></ClassCard>
              </v-col>
            </v-row>
            <v-row v-if="pendingClasses.length > 0">
              <v-col cols="12" sm="6" md="4" v-for="(studentClass, index) in pendingClasses" :key="studentClass.hash">
                <ClassCard :student-class="studentClass" :index="index"></ClassCard>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-if="userClasses.length === 0 && pendingClasses.length === 0">
            You're not enrolled in any classes.
            <v-btn text :to="{name: 'AllClasses'}">ENROLL NOW!</v-btn>
          </v-card-text>
        </v-card>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn fixed dark fab right bottom color="primary" v-on="on" :to="{name: 'AllClasses'}">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Enroll to New Class</span>
        </v-tooltip>
        <!-- to add extra space for the FAB if the user scrolled to the bottom of the page-->
        <div style="height: 10px;"></div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import ClassCard from "@/components/classes/shared/ClassCard";

export default {
  name: "EnrolledClasses",
  data() {
    return {
      userClasses: [],
      pendingClasses: [],
      totalClasses: 0,
      selection: 0,
      loading: false,
    }
  },
  components: {ClassCard, AppBar},
  methods: {
    getEnrolledClasses() {
      this.loading = true
      api({
        method: "GET",
        url: "/classes",
      }).then(response => {
        this.userClasses = []
        this.pendingClasses = []
        response.data.classes.forEach(classUser => {
          if (classUser.activated)
            this.userClasses.push(classUser)
          else
            this.pendingClasses.push(classUser)
        })
        this.$store.dispatch('setUserClasses', this.userClasses)
        if (this.userClasses.length > 0)
          this.$store.dispatch('setUserClass', 0)
      }).finally(() => {
        this.loading = false
      })
    },
  },
  mounted() {
    this.getEnrolledClasses()
  }
}
</script>

<style scoped>

</style>