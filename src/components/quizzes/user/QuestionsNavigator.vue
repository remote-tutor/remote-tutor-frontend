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
              <v-col v-for="(submission, index) in submissions" :key="index" cols="3">
                <v-btn class="rounded-circle"
                       :color="getButtonColor(index)"
                       :value="index"
                       :disabled="updatedSelection === index">
                  {{ index + 1 }}
                </v-btn>
              </v-col>
            </v-row>
          </v-btn-toggle>
          <Timer :end-time="validTill" :time-up.sync="timeUp" v-if="!isReview && fetch.quizGrade"></Timer>
        </v-col>

        <v-card-subtitle v-if="isReview">Score: {{ quizGrade.grade }} / {{ quiz.totalMark }}</v-card-subtitle>
        <v-dialog v-model="dialog" width="500" :persistent="timeUp" v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="success" dark v-bind="attrs" v-on="on">Submit</v-btn>
          </template>

          <v-card>
            <v-card-title class="headline grey lighten-2">
              <div v-if="timeUp">Time's Up</div>
              <div v-else>Confirmation</div>
            </v-card-title>
            <v-card-text>
              <QuizReview :submissions="submissions"></QuizReview>
            </v-card-text>
            <v-card-subtitle v-if="!timeUp">Submit all answers and exit ?</v-card-subtitle>

            <v-divider></v-divider>

            <v-card-actions v-if="timeUp">
              <v-btn text color="secondary" :to="{ name: 'Quizzes' }">OK</v-btn>
            </v-card-actions>
            <v-card-actions v-else>
              <v-btn color="secondary" text @click="hideDialog">Cancel</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="success" text @click="exit">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-list-item-content>

    </v-list-item>
  </v-card>
</template>

<script>
import api from "@/gateways/api";
import Timer from "@/components/utils/Timer";
import QuizReview from "@/components/quizzes/user/QuizReview";

export default {
  name: "QuestionsNavigator",
  components: {QuizReview, Timer},
  props: ['selectedQuestion', 'submissions', 'questions', 'isReview', 'quiz'],
  data() {
    return {
      updatedSelection: this.selectedQuestion || 0,
      quizGrade: {},
      dialog: false,
      timeUp: false,
      validTill: null,
      fetch: {
        quizGrade: false,
      },
    }
  },
  methods: {
    getButtonColor(index) {
      if (this.isReview)
        if (this.submissions[index] === this.questions[index].correctAnswer)
          return 'success'
        else
          return 'red'

      if (this.updatedSelection === index)
        return 'primary'
      if (this.submissions[index] === null)
        return 'secondary'
      return 'light-blue'
    },
    checkQuiz() {
      if (!this.isReview &&
          (new Date().getTime() < new Date(this.quiz.startTime).getTime() ||
              new Date().getTime() > new Date(this.validTill).getTime())) {
        this.$router.push({name: 'Quizzes'})
        this.$store.dispatch('viewSnackbar', {
          text: 'Invalid request',
          color: 'error'
        })
      } else if (this.isReview && new Date().getTime() < new Date(this.quiz.endTime)) {
        this.$router.push({name: 'Quizzes'})
        this.$store.dispatch('viewSnackbar', {
          text: 'Invalid request',
          color: 'error'
        })
      } else {
        this.getQuizPermission()
      }
    },
    getQuizPermission() {
      api({
        method: "GET",
        url: "/payments/week",
        params: {
          eventDate: new Date(this.quiz.startTime).getTime()
        }
      }).then(response => {
        if (!response.data.status) {
          this.$router.push({name: 'Quizzes'})
          this.$store.dispatch('viewSnackbar', {
            text: "You don't have access to take this quiz. Contact the administrator for help",
            color: 'error'
          })
        }
      })
    },
    createQuizGrade() {
      let formData = new FormData()
      formData.append("quizID", this.quiz.ID)
      return api({
        method: "POST",
        url: "/quizzes/grades",
        data: formData,
      })
    },
    getQuizGrade() {
      api({
        method: "GET",
        url: "/quizzes/grades",
        params: {
          quizID: this.quiz.ID
        }
      }).then(response => {
        this.quizGrade = response.data.quizGrade[0]
      })
    },
    hideDialog() {
      this.dialog = false
    },
    exit() {
      this.hideDialog()
      this.$router.push({name: 'Quizzes'})
    }
  },
  watch: {
    selectedQuestion(val) {
      this.updatedSelection = val
    },
    timeUp(val) {
      if (val) {
        this.dialog = true
      }
    }
  },
  mounted() {
    if (this.isReview)
      this.getQuizGrade()
    else
      this.createQuizGrade().then(response => {
        this.validTill = response.data.validTill
        this.fetch.quizGrade = true
        this.checkQuiz()
      })
  },
}
</script>

<style scoped>

</style>