<template>
  <v-app>
    <AppBar page-name="Assignment"></AppBar>
    <v-main>
      <v-container>
        <AdminAssignmentData v-if="userData.admin"></AdminAssignmentData>
        <StudentAssignmentData v-else></StudentAssignmentData>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import AdminAssignmentData from "@/components/assignments/admins/AssignmentData";
import StudentAssignmentData from "@/components/assignments/users/AssignmentData";
import {mapState} from "vuex";
export default {
name: "Assignment",
  components: {AdminAssignmentData, StudentAssignmentData, AppBar},
  computed: {
    ...mapState(['userData']),
  },
}
</script>

<style scoped>

</style>