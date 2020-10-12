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
    <v-card-subtitle v-if="studentClass">Taught By: {{studentClass.class.organization.teacherName}}</v-card-subtitle>
    <v-card-subtitle v-if="availableClass">Taught By: {{availableClass.organization.teacherName}}</v-card-subtitle>
    <v-card-actions>
      <v-btn color="primary" @click="changeSelectedClass" v-if="studentClass">Select</v-btn>
      <v-btn color="primary" @click="enrollToClass" v-if="availableClass">Enroll</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "ClassCard",
  props: ['studentClass', 'index', 'availableClass'],
  methods: {
    changeSelectedClass() {
      this.$store.dispatch('setUserClass', this.index)
      this.$router.push({name: 'Announcements'})
    },
    enrollToClass() {

    },
  },
}
</script>

<style scoped>

</style>