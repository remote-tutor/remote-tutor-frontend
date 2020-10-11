<template>
  <v-app>
    <AppBar page-name="Classes"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="(studentClass, index) in classes" :key="studentClass.hash">
            <ClassCard :student-class="studentClass" :index="index"></ClassCard>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import ClassCard from "@/components/classes/users/ClassCard";

export default {
  name: "Classes",
  data() {
    return {
      classes: []
    }
  },
  components: {ClassCard, AppBar},
  methods: {
    getClasses() {
      api({
        method: "GET",
        url: "/classes",
      }).then(response => {
        this.classes = response.data.classes
        this.$store.dispatch('setUserClasses', response.data.classes)
      })
    }
  },
  mounted() {
    this.getClasses()
  }
}
</script>

<style scoped>

</style>