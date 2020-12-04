<template>
  <v-app>
    <AppBar page-name="Students Access"></AppBar>
    <v-main>
      <v-container>
        <StudentsTable></StudentsTable>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import StudentsTable from "@/components/payments/admins/StudentsTable";
export default {
  name: "Access",
  components: {StudentsTable, AppBar}
}
</script>

<style scoped>

</style>