<template>
  <v-app>
    <AppBar page-name="Quiz"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <v-col class="col-12 col-md-9">
            <Question v-if="fetch.questions"
                      :question="questions[selectedQuestion]"
                      :mcq="true" :selected-choice="submissions[selectedQuestion]"
                      @updateChoice="updateChoice"
                      :selected-question.sync="selectedQuestion"
                      :disable-previous="selectedQuestion === 0"
                      :disable-next="selectedQuestion === questions.length - 1"
                      :isReview="isReview" :saving="saving"
                      :quiz="quiz"
            ></Question>
          </v-col>
          <v-col class="col-12 col-md-3" v-if="quiz !== null">
            <QuestionsNavigator v-if="fetch.quiz && fetch.questions"
                                :submissions="submissions"
                                :questions="questions"
                                :selected-question.sync="selectedQuestion"
                                :isReview="isReview"
                                :quiz="quiz"
            ></QuestionsNavigator>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>

</template>

<script>
import Question from "@/components/quizzes/user/Question";
import api from "@/gateways/api";
import {mapState} from "vuex";
import QuestionsNavigator from "@/components/quizzes/user/QuestionsNavigator";
import AppBar from "@/components/utils/AppBar";
import questions from "@/static-data/questions.json"
import quizzes from "@/static-data/current-quizzes.json"

export default {
  name: "Quiz",
  components: {
    AppBar,
    QuestionsNavigator,
    Question
  },
  data() {
    return {
      questions: [],
      submissions: [],
      selectedQuestion: 0,
      quiz: null,
      isReview: this.$route.params.action === 'review',
      saving: false,
      fetch: {
        questions: false,
        quiz: false,
      }
    }
  },
  computed: {
    ...mapState(['userData', 'isLoggedIn']),
  },
  methods: {
    async getQuestions() {
      let response = await api({
        method: "GET",
        url: "/quizzes/questions",
        params: {
          quizID: this.quiz.ID
        }
      })
      this.questions = response.data.mcqs
      this.submissions = Array(this.questions.length).fill(null)
      this.selectedQuestion = 0
      api({
        method: "GET",
        url: "/quizzes/submissions",
        params: {
          quizID: this.quiz.ID
        }
      }).then(response => {
        let mcqSubmissions = response.data.mcqSubmissions

        for (let i = 0; i < this.questions.length; i++)
          for (let j = 0; j < mcqSubmissions.length; j++)
            if (this.questions[i].question.ID === mcqSubmissions[j].mcqID) {
              this.submissions.splice(i, 1, mcqSubmissions[j].userResult)
              // this.submissions[i] = mcqSubmissions[j].userResult
            }
        // to convince Vue that the array actually changed
        // this.submissions = this.submissions.slice()
        this.fetch.questions = true
      })
      // GET SUBMISSIONS
    },
    async updateChoice(options) {
      if (options.status) {
        this.submissions.splice(this.selectedQuestion, 1, options.choice)
      } else {
        let oldValue = this.submissions[this.selectedQuestion]
        await this.submissions.splice(this.selectedQuestion, 1, 0)
        this.submissions.splice(this.selectedQuestion, 1, oldValue)
      }
    },
    getQuiz() {
      return api({
        method: "GET",
        url: "/quizzes/quiz",
        params: {
          quizHash: this.$route.params.quizHash,
        }
      })
    },
  },
  created() {
    if (this.isLoggedIn) {
      this.getQuiz().then(response => {
        this.quiz = response.data.quiz
        this.getQuestions()
        this.fetch.quiz = true
      })
    } else {
      this.questions = questions
      this.submissions = this.questions.map(() => {
        let randomChoice = Math.floor(Math.random() * 8 + 1) // generate a random number between 1 and 8
        if (randomChoice > 4) return null
        return randomChoice
      })
      if(this.$route.params.quizHash === "CURRENT")
        this.quiz = quizzes.current[0]
      else
        this.quiz = quizzes.past[0]
      this.fetch.quiz = true
      this.fetch.questions = true
    }
  },
}
</script>