<template>
  <v-app>
    <AppBar page-name="Quizzes"></AppBar>
    <v-main>
      <v-container>
        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab>Current Quizzes</v-tab>
          <v-tab>Upcoming Quizzes</v-tab>
          <v-tab>Past Quizzes</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <DataTable title="Current Quizzes" :type="0"></DataTable>
          </v-tab-item>
          <v-tab-item>
            <DataTable title="Upcoming Quizzes" :type="1"></DataTable>
          </v-tab-item>
          <v-tab-item>
            <DataTable title="Past Quizzes" :type="-1"></DataTable>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import DataTable from "@/components/quizzes/shared/DataTable";
import AppBar from "@/components/utils/AppBar";

export default {
  name: "Quizzes",
  components: {
    AppBar,
    DataTable,
  },
  data() {
    return {
      tab: 0,
    }
  }
}
</script>

<style scoped>

</style>