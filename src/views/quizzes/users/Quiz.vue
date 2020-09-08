<template>
  <v-app>
    <QuizzesAppBar></QuizzesAppBar>
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
                      :isReview="isReview"
            ></Question>
          </v-col>
          <v-col class="col-12 col-md-3">
            <QuestionsNavigator :submissions="submissions"
                                :questions="questions"
                                :selected-question.sync="selectedQuestion"
                                :isReview="isReview"
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
import QuizzesAppBar from "@/components/quizzes/shared/AppBar";

export default {
  name: "Quiz",
  components: {
    QuizzesAppBar,
    QuestionsNavigator,
    Question
  },
  data() {
    return {
      questions: [],
      submissions: [],
      selectedQuestion: 0,
      quizID: this.$route.params.quizID,
      isReview: this.$route.params.action === 'review'
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
          quizID: this.$route.params.quizID
        }
      })
      this.questions = response.data.mcqs
      this.submissions = Array(this.questions.length).fill(-1)
      this.selectedQuestion = 0
      api({
        method: "GET",
        url: "/quizzes/submissions",
        params: {
          quizID: this.$route.params.quizID
        }
      }).then(response => {
        let mcqSubmissions = response.data.mcqSubmissions
        if (mcqSubmissions !== null)
          for (let i = 0; i < mcqSubmissions.length; i++)
            for (let j = 0; j < mcqSubmissions.length; j++)
              if (this.questions[i].question.id === mcqSubmissions[j].mcqID) {
                this.submissions[i] = mcqSubmissions[i].userResult
              }
         // to convince Vue that the array actually changed
        this.submissions = this.submissions.slice()
      })
      // GET SUBMISSIONS
    },
    updateChoice(options) {
      let method = (this.submissions[this.selectedQuestion] === -1) ? "POST" : "PUT"
      let formData = new FormData()
      formData.append("mcqID", this.questions[this.selectedQuestion].question.id)
      formData.append("quizID", this.quizID)
      formData.append("userResult", options.choice)
      console.log(options.choice)
      api({
        method: method,
        url: "/quizzes/submissions/mcq",
        data: formData
      })
      let updatedSubmissions = this.submissions.slice() // to convince Vue that the array actually changed
      updatedSubmissions[this.selectedQuestion] = options.choice
      this.submissions = updatedSubmissions
    },
    createQuizGrade() {
      let formData = new FormData()
      formData.append("quizID", this.$route.params.quizID)
      api({
        method: "POST",
        url: "/quizzes/grades",
        data: formData,
      })
    }
  },
  mounted() {
    this.getQuestions()
    this.createQuizGrade()
  },
}
</script>