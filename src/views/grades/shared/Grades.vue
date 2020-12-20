<template>
  <v-app>
    <AppBar page-name="Grades"></AppBar>
    <v-main>
      <v-container>
        <DataTable title="Quizzes"></DataTable>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import DataTable from "@/components/grades/shared/DataTable";
import AppBar from "@/components/utils/AppBar";

export default {
  name: "Grades",
  components: {
    AppBar,
    DataTable,
  },
  data() {
    return {
      tab: 0
    }
  }
}
</script>

<style scoped>

</style>