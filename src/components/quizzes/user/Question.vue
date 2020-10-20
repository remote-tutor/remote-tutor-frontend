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
      <v-img v-if="question.question.image !== undefined" :src="imageSrc"></v-img>

      <div v-if="mcq">
        <v-radio-group v-model="updatedChoice"
                       :readonly="isReview"
                       :disabled="isReview || saving"
                       column>
          <v-radio v-for="choice in question.choices" class="pa-1"
                   :key="choice.ID"
                   :value="choice.ID"
                   :label="choice.text"
                   :class="getLabelColor(choice)">
          </v-radio>
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
import api from "@/gateways/api";

export default {
  name: "Question",
  props: ['question', 'mcq', 'selectedChoice', 'selectedQuestion', 'disablePrevious', 'disableNext', 'isReview'],
  data() {
    return {
      saving: false,
    }
  },
  methods: {
    updateSelectedChoice(userChoice) {
      this.saving = true
      let method = (this.selectedChoice === -1) ? "POST" : "PUT"
      let formData = new FormData()
      formData.append("mcqID", this.question.question.ID)
      formData.append("quizID", this.$route.params.quizID)
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
      }).catch(async () => {
        this.$store.dispatch('viewSnackbar', {
          text: 'Error saving question #' + (this.selectedQuestion + 1),
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
    imageSrc: function () {
      return process.env.VUE_APP_API_URL + "/image/" + this.question.question.imagePath
    }
  },

}
</script>

<style scoped>
>>> .theme--light.v-radio--is-disabled.highlighted label {
  color: black !important;
}
</style>