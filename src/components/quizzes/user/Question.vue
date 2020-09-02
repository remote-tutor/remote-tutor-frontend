<template>
  <v-card class="elevation-12" v-if="question">
    <v-toolbar color="primary" flat dark>
      <v-spacer></v-spacer>

      <span>Marks</span>
      <v-col cols="3" md="2">
        <template>
          <v-btn icon large :readonly="true">
            {{ question.question.totalMark }}
          </v-btn>
        </template>

      </v-col>
    </v-toolbar>
    <v-card-text>
      <v-card-title class="headline">
        {{ question.question.text }}
      </v-card-title>

      <div v-if="mcq">
        <v-radio-group v-model="updatedChoice"
                       :readonly="review"
                       :disabled="review"
                       @change="(val) => $emit('updateChoice', {choice: val || -1})"
                       column>
          <v-col>
            <v-radio v-for="choice in question.choices" class="pa-2"
                     :key="choice.id"
                     :value="choice.id"
                     :label="choice.text">
            </v-radio>
          </v-col>
        </v-radio-group>
      </div>

    </v-card-text>
    <v-card-actions>
      <v-btn color="secondary" @click="updateSelectedQuestion(-1)" :disabled="disablePrevious">Previous</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="secondary" @click="updateSelectedQuestion(1)" :disabled="disableNext">Next</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "Question",
  props: ['question', 'mcq', 'review', 'selectedChoice', 'selectedQuestion', 'disablePrevious', 'disableNext'],
  data() {
    return {
      updatedChoice: this.selectedChoice || -1
    }
  },
  methods: {
    updateSelectedQuestion(value) {
      if (this.disablePrevious && value === -1)
        return
      if (this.disableNext && value === 1)
        return
      this.$emit('update:selectedQuestion', this.selectedQuestion + value)
    }
  },
  watch: {
    selectedChoice: function (val) {
      this.updatedChoice = val || -1
    }
  }
}
</script>

<style scoped>

</style>