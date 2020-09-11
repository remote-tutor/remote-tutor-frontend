<template>
  <v-app>
    <StudentsAppBar
        :admin="true"
    ></StudentsAppBar>
    <v-main>
      <v-container>
        <StudentsTable :pending="true"></StudentsTable>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import StudentsAppBar from "@/components/students/admins/AppBar.vue";
import StudentsTable from '@/components/students/admins/StudentsTable.vue'

export default {
  name: "PendingStudents",
  components: {
    StudentsAppBar,
    StudentsTable,
  }
};
</script>