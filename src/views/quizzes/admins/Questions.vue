<template>
  <v-app>
    <QuizzesAppBar
        :admin="admin"
        :placeholderExists="placeholderExists"
        @createPlaceholder="createPlaceholder"
    ></QuizzesAppBar>
    <v-main>
      <v-container>
        <Question v-if="placeholderExists" :isNew="true"
                  @deleteNewAnnouncement="deleteNewQuestion"
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
  },
  mounted() {
    this.getQuestions()
  }
};
</script>