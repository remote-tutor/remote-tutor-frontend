<template>
  <v-app>
    <AppBar page-name="Students"></AppBar>
    <v-main>
      <v-container>
        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab>Pending Students</v-tab>
          <v-tab>Active Students</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <StudentsTable :pending="true"></StudentsTable>
          </v-tab-item>
          <v-tab-item>
            <StudentsTable :pending="false"></StudentsTable>
          </v-tab-item>
        </v-tabs-items>


      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import StudentsTable from '@/components/students/admins/StudentsTable.vue'
import AppBar from "@/components/utils/AppBar";

export default {
  name: "PendingStudents",
  components: {
    AppBar,
    StudentsTable,
  },
  data() {
    return {
      tab: 0,
    }
  }
};
</script>