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
          <Timer :end-time="quiz.endTime"></Timer>
        </v-col>
        <ConfirmationDialog button-text="Submit"
                            btn-color="success"
                            message="Submit all answers and exit ?">

          <template v-slot:main-content>
            <QuizReview :submissions="submissions"></QuizReview>
          </template>

        </ConfirmationDialog>
      </v-list-item-content>

    </v-list-item>
  </v-card>
</template>

<script>
import api from "@/gateways/api";
import Timer from "@/components/utils/Timer";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import QuizReview from "@/components/quizzes/user/QuizReview";

export default {
  name: "QuestionsNavigator",
  components: {QuizReview, ConfirmationDialog, Timer},
  props: ['selectedQuestion', 'submissions'],
  data() {
    return {
      updatedSelection: this.selectedQuestion || 0,
      quiz: {},
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
    getQuiz() {
      api({
        method: "GET",
        url: "/quizzes/quiz",
        params: {
          id: this.$route.params.quizID,
        }
      }).then(response => {
        this.quiz = response.data.quiz
      })
    },
  },
  created() {
    this.getQuiz()
  },
}
</script>

<style scoped>

</style>