<template>
  <v-card>
    <v-card-title>{{ studentClass.class.organization.subject }}</v-card-title>
    <v-card-subtitle>Taught By: {{studentClass.class.organization.teacherName}}</v-card-subtitle>
    <v-card-actions>
      <v-btn color="primary" @click="changeSelectedClass">Select</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "ClassCard",
  props: ['studentClass', 'index'],
  methods: {
    changeSelectedClass() {
      this.$store.dispatch('setUserClass', this.index)
      this.$router.push({name: 'Announcements'})
    }
  }
}
</script>

<style scoped>

</style>