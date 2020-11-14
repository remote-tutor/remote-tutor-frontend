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
    <v-card-title class="headline">
      {{ question.question.text }}
      <v-img v-if="question.question.imagePath.length > 0" :src="question.question.imagePath"></v-img>
    </v-card-title>
    <v-card-text>
      <v-radio-group v-model="updatedChoice"
                     :readonly="isReview"
                     :disabled="isReview || saving"
                     column>
        <v-radio v-for="(choice, index) in question.choices" class="pa-1"
                 :key="index"
                 :value="choice.ID"
                 :label="choice.text"
                 :class="getLabelColor(choice)">
        </v-radio>
      </v-radio-group>
    </v-card-text>
    <v-card-actions>
      <v-btn color="secondary" @click="updateSelectedQuestion(-1)" :disabled="disablePrevious">Previous</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="secondary" @click="updateSelectedQuestion(1)" :disabled="disableNext">Next</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "Question",
  props: ['question', 'mcq', 'selectedChoice', 'selectedQuestion', 'disablePrevious', 'disableNext', 'isReview', 'quiz'],
  data() {
    return {
      saving: false,
    }
  },
  methods: {
    updateSelectedChoice(userChoice) {
      this.saving = true
      let method = (this.selectedChoice === null) ? "POST" : "PUT"
      let formData = new FormData()
      formData.append("mcqID", this.question.question.ID)
      formData.append("quizID", this.quiz.ID)
      formData.append("userResult", userChoice)
      api({
        method: method,
        url: "/quizzes/submissions/mcq",
        data: formData
      }).then(() => {
        this.$store.dispatch('viewSnackbar', {
          text: 'Question #' + (this.selectedQuestion + 1) + ' has been saved successfully',
          color: 'success'
        })
        this.$emit('updateChoice', {
          choice: userChoice,
          status: true
        })
      }).catch(() => {
        this.$store.dispatch('viewSnackbar', {
          text: 'Error saving question #' + (this.selectedQuestion + 1) + '. Please refresh the page and try again',
          color: 'error'
        })
        this.$emit('updateChoice', {
          choice: userChoice,
          status: false
        })
      }).finally(() => {
        this.saving = false
      })
    },
    updateSelectedQuestion(value) {
      if (this.disablePrevious && value === -1)
        return
      if (this.disableNext && value === 1)
        return
      this.$emit('update:selectedQuestion', this.selectedQuestion + value)
    },
    getLabelColor(choice) {
      if (this.isReview && choice.ID === this.question.correctAnswer)
        return ' highlighted success'
      if (this.isReview && choice.ID === this.selectedChoice)
        return 'highlighted red'
      return ''
    }
  },
  computed: {
    updatedChoice: {
      get() {
        return this.selectedChoice
      },
      set(val) {
        this.updateSelectedChoice(val)
      }
    },
  },

}
</script>

<style scoped>
>>> .theme--light.v-radio--is-disabled.highlighted label {
  color: black !important;
}
</style>