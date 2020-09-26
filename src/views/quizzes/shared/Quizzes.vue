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
            <QuizzesTable title="Current Quizzes" :type="0"></QuizzesTable>
          </v-tab-item>
          <v-tab-item>
            <QuizzesTable title="Upcoming Quizzes" :type="1"></QuizzesTable>
          </v-tab-item>
          <v-tab-item>
            <QuizzesTable title="Past Quizzes" :type="-1"></QuizzesTable>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import QuizzesTable from "@/components/quizzes/shared/QuizzesTable";
import AppBar from "@/components/utils/AppBar";

export default {
  name: "Quizzes",
  components: {
    AppBar,
    QuizzesTable,
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