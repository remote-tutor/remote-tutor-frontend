<template>
  <v-app>
    <AppBar page-name="Grades"></AppBar>
    <v-main>
      <v-container>
        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab>Quizzes</v-tab>
          <v-tab>Assignments</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <DataTable title="Quizzes"></DataTable>
          </v-tab-item>
          <v-tab-item>

          </v-tab-item>
        </v-tabs-items>
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