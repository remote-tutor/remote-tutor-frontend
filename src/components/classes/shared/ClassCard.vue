<template>
  <v-card>
    <v-card-title v-if="studentClass">
      {{ studentClass.class.organization.subject }}
      <v-spacer></v-spacer>
      {{ studentClass.class.name }}
    </v-card-title>
    <v-card-title v-if="availableClass">
      {{ availableClass.organization.subject }}
      <v-spacer></v-spacer>
      {{ availableClass.name }}
    </v-card-title>
    <v-card-subtitle v-if="studentClass">Taught By: {{ studentClass.class.organization.teacherName }}</v-card-subtitle>
    <v-card-subtitle v-if="availableClass">Taught By: {{ availableClass.organization.teacherName }}</v-card-subtitle>

    <v-card-actions v-if="studentClass">
      <v-btn color="primary" @click="changeSelectedClass" v-if="studentClass.activated">Select</v-btn>
      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>Waiting for activation</span>
      </v-tooltip>
      <v-spacer></v-spacer>
    </v-card-actions>

    <v-card-actions v-else-if="availableClass">
      <v-btn color="primary" :loading="loading"
             @click="enrollToClass(availableClass.hash)" v-if="!selected">Enroll
      </v-btn>
      <v-tooltip bottom v-else-if="selected">
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="green" dark v-bind="attrs" v-on="on">mdi-check</v-icon>
        </template>
        <span>You've enrolled successfully! - wait for admin verification to access the class -</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "ClassCard",
  props: ['studentClass', 'index', 'availableClass'],
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      loading: false,
      selected: false,
    }
  },
  methods: {
    changeSelectedClass() {
      this.$store.dispatch('setUserClass', this.index)
      this.$router.push({name: 'Announcements'})
    },
    enrollToClass(classHash) {
      this.loading = true
      let formData = new FormData()
      formData.append("newSelectedClass", classHash)
      api({
        method: "POST",
        url: "/classes/enroll",
        data: formData
      }).then(() => {
        this.selected = true
      }).finally(() => {
        this.loading = false
      })
    },
  },
}
</script>

<style scoped>

</style>