<template>
  <v-app>
    <QuizzesAppBar
        :admin="admin"
        :iconsNeeded="true"
        :placeholderExists="placeholderExists"
        @createPlaceholder="createPlaceholder"
    ></QuizzesAppBar>
    <v-main>
      <v-container>
        <Question v-if="placeholderExists" :isNew="true"
                  @deleteNewQuestion="deleteNewQuestion"
                  @placeholderFilled="placeholderFilled"
                  :admin="admin">
        </Question>

        <Question v-for="question in questions"
                  :key="question.question.id"
                  :staticText="question.question.text"
                  :staticTotalMark="question.question.totalMark"
                  :staticID="question.question.id"
                  :staticCorrectAnswer="question.correctAnswer"
                  :staticChoices="question.choices"
                  :isNew="question.isNew"
                  @deleteQuestion="deleteQuestion"
        ></Question>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import QuizzesAppBar from "@/components/quizzes/shared/AppBar.vue";
import Question from '@/components/quizzes/admins/Question.vue'
import api from "@/gateways/api";

export default {
  name: "Questions",
  components: {
    QuizzesAppBar,
    Question,
  },
  data() {
    return {
      questions: [],
      admin: true,
      placeholderExists: false,

    }
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
      })
    },
    createPlaceholder() {
      this.placeholderExists = true;
    },
    deleteNewQuestion() {
      this.placeholderExists = false;
    },
    placeholderFilled(options) {
      this.placeholderExists = false;
      if (options.new) {
        let questionData = options.questionData
        this.questions.unshift(questionData);
      }
    },
    deleteQuestion(options) {
      this.questions.forEach((question, index) => {
        if (options.id === question.question.id) {
          this.questions.splice(index, 1)
        }
      })
    }
  },
  mounted() {
    this.getQuestions()
  }
};
</script>