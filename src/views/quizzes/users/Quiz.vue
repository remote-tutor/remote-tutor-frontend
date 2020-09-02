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
            ></Question>
          </v-col>
          <v-col class="col-12 col-md-3">
            <QuestionsNavigator :submissions="submissions"
                                :selected-question.sync="selectedQuestion"
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
        let userSubmissions = response.data.mcqSubmissions
        for (let i = 0; i < userSubmissions.length; i++)
          for (let j = 0; j < userSubmissions.length; j++)
            if (this.questions[i].question.id === userSubmissions[j].submission.questionID) {
              this.submissions[i] = userSubmissions[i].userResult
            }
        let updatedSubmissions = this.submissions.slice() // to convince Vue that the array actually changed
        this.submissions = updatedSubmissions
      })
      // GET SUBMISSIONS
    },
    updateChoice(options) {
      let method = (this.submissions[this.selectedQuestion] === -1) ? "POST" : "PUT"
      let formData = new FormData()
      formData.append("mcqID", this.questions[this.selectedQuestion].question.id)
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
  },
  mounted() {
    this.getQuestions()
  },
}
</script>