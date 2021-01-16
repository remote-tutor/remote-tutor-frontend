<template>
  <v-app>
    <AppBar page-name="Quiz"></AppBar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="9">
            <Question
                v-if="fetch.questions && fetch.quiz && questions.length > 0"
                :question="questions[selectedQuestion]"
                :quiz="quiz"
                :is-new.sync="newQuestion"
                :edit-mode.sync="editMode"
                @updateQuestion="updateQuestion"
                @deleteQuestion="deleteQuestion"
            ></Question>
          </v-col>
          <v-col cols="12" md="3">
            <QuestionsNavigator
                :questions="questions"
                :selectedQuestion.sync="selectedQuestion"
                @createPlaceholder="createPlaceholder"
                :edit-mode="editMode"
            ></QuestionsNavigator>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Question from '@/components/quizzes/admins/Question.vue'
import api from "@/gateways/api";
import AppBar from "@/components/utils/AppBar";
import QuestionsNavigator from "@/components/quizzes/admins/QuestionsNavigator";

export default {
  name: "Quiz",
  components: {
    QuestionsNavigator,
    AppBar,
    Question,
  },
  data() {
    return {
      questions: [],
      admin: true,
      quiz: null,
      selectedQuestion: 0,
      editMode: false,
      newQuestion: false,
      fetch: {
        questions: false,
        quiz: false,
      }
    }
  },
  methods: {
    getQuiz() {
      return api({
        method: "GET",
        url: "/quizzes/quiz",
        params: {
          quizHash: this.$route.params.quizHash,
        }
      })
    },
    getQuestions() {
      api({
        method: "GET",
        url: "/quizzes/questions",
        params: {
          quizID: this.quiz.ID
        }
      }).then(response => {
        this.questions = response.data.mcqs
        for (let i = 0; i < this.questions.length; i++) {
          this.questions[i].question.imageSrc = this.questions[i].question.imagePath
        }
        this.fetch.questions = true
      })
    },
    createPlaceholder() {
      this.editMode = true
      this.newQuestion = true
      this.questions.push({
        question: {},
        choices: [
          {ID: 0, text: 'A', isNew: true},
          {ID: 1, text: 'B', isNew: true},
          {ID: 2, text: 'C', isNew: true},
          {ID: 3, text: 'D', isNew: true},
        ]
      })

    },
    updateQuestion(question) {
      question.choices.forEach((choices, index) => {
        question.choices[index].isNew = false
      })
      this.questions[this.selectedQuestion] = question
      this.newQuestion = false
    },
    deleteQuestion() {
      if (this.selectedQuestion >= (this.questions.length - 1)) {
        this.selectedQuestion = this.questions.length - 2
        this.questions.splice(-1, 1)
      } else {
        this.questions.splice(this.selectedQuestion, 1)
      }
    }
  },
  mounted() {
    this.getQuiz().then((response) => {
      this.quiz = response.data.quiz
      this.fetch.quiz = true
      this.getQuestions()
    })
  }
};
</script>