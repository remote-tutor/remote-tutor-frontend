<template>
  <v-app>
    <AppBar page-name="Assignment"></AppBar>
    <v-main>
      <v-container>
        <AssignmentData></AssignmentData>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import AssignmentData from "@/components/assignments/shared/AssignmentData";
export default {
name: "Assignment",
  components: {AssignmentData, AppBar}
}
</script>

<style scoped>

</style>