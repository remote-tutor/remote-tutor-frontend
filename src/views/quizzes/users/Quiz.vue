<template>
  <v-app>
    <AppBar page-name="Quiz"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <v-col class="col-12 col-md-9">
            <Question :question="questions[selectedQuestion]"
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
            <QuestionsNavigator :submissions="submissions"
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
    }
  },
  computed: {
    ...mapState(['userData']),
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
    createQuizGrade() {
      let formData = new FormData()
      formData.append("quizID", this.quiz.ID)
      api({
        method: "POST",
        url: "/quizzes/grades",
        data: formData,
      })
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
    this.getQuiz().then(response => {
      this.quiz = response.data.quiz
      this.getQuestions()
      if (!this.isReview)
        this.createQuizGrade()
    })
  },
}
</script>