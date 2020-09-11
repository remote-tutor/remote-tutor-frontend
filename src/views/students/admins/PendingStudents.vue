<template>
  <v-app>
    <AppBar page-name="Students"></AppBar>
    <v-main>
      <v-container>
        <StudentsTable :pending="true"></StudentsTable>
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
  }
};
</script>