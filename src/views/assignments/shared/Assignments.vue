<template>
  <v-app>
    <AppBar page-name="Assignments"></AppBar>
    <v-main>
      <v-container>
        <AssignmentsTable></AssignmentsTable>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import AssignmentsTable from "@/components/assignments/shared/AssignmentsTable";
export default {
name: "Assignments",
  components: {AssignmentsTable, AppBar}
}
</script>

<style scoped>

</style>