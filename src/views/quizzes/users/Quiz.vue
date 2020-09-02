<template>
  <v-app>
    <QuizzesAppBar></QuizzesAppBar>
    <v-main>
      <v-row>
        <v-col cols="9">
          <Question :question="questions[selectedQuestion]"
                    :mcq="true" :selected-choice="submissions[selectedQuestion]"
                    @updateChoice="updateChoice"
                    ></Question>
        </v-col>
        <v-col cols="3">
          <QuestionsNavigator :submissions="submissions"
                              :selected-question.sync="selectedQuestion"
          ></QuestionsNavigator>
        </v-col>
      </v-row>

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
    getQuestions() {
      api({
        method: "GET",
        url: "/quizzes/questions",
        params: {
          quizID: this.$route.params.quizID
        }
      }).then(response => {
        this.questions = response.data.mcqs
        this.submissions = Array(this.questions.length).fill(-1)
        this.selectedQuestion = 0
      })
      // GET SUBMISSIONS
    },
    updateChoice(options) {
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