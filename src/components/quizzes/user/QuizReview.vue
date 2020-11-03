<template>
  <v-simple-table dense>
    <template>
      <thead>
      <tr>
        <th class="text-left">Question Number</th>
        <th class="text-left">Status</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(submission, index) in submissions" :key="index">
        <td>{{ index + 1 }}</td>
        <td v-if="submission !== null" class="success--text">Saved</td>
        <td v-else class="red--text">Empty</td>
      </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  name: "QuizReview",
  props: ['submissions'],
  data() {
    return {}
  },
}
</script>