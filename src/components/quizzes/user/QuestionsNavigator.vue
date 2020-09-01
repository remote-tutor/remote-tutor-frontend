<template>
  <v-card outlined>
    <v-list-item>
      <v-list-item-content>
        <v-col>
          <p>Questions</p>

          <v-btn-toggle
              v-model="updatedSelection"
              @change="(val) => $emit('update:selectedQuestion', val)"
              tile
              color="deep-purple accent-3"
              group>
            <v-row dense>
              <v-col v-for="(submission, index) in submissions" :key="submission.id" cols="3">
                <v-btn class="rounded-circle"
                       :color="getButtonColor(index)"
                       :value="index"
                       :disabled="updatedSelection === index">
                  {{ index + 1 }}
                </v-btn>
              </v-col>
            </v-row>
          </v-btn-toggle>
        </v-col>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
export default {
  name: "QuestionsNavigator",
  props: ['selectedQuestion', 'submissions'],
  data() {
    return {
      updatedSelection: this.selectedQuestion || 0,
    }
  },
  methods: {
    getButtonColor(index) {
      if (this.updatedSelection === index)
        return 'primary'
      if (this.submissions[index] === -1)
        return 'secondary'
      return 'success'
    },
  },
}
</script>

<style scoped>

</style>