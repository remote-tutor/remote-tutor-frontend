<template>
  <v-app>
    <AppBar page-name="Quiz"></AppBar>
    <v-main>
      <v-container>
        <Question v-if="placeholderExists" :isNew="true"
                  @deleteNewQuestion="deleteNewQuestion"
                  @placeholderFilled="placeholderFilled"
                  :quiz="quiz"
                  :admin="admin">
        </Question>

        <Question v-for="question in questions"
                  :key="question.question.ID"
                  :staticText="question.question.text"
                  :staticTotalMark="question.question.totalMark"
                  :staticID="question.question.ID"
                  :staticCorrectAnswer="question.correctAnswer"
                  :staticChoices="question.choices"
                  :static-image="question.question.image"
                  :static-image-path="question.question.imagePath"
                  :isNew="question.isNew"
                  :quiz="quiz"
                  @deleteQuestion="deleteQuestion"
        ></Question>

        <v-btn fixed dark fab right bottom color="primary" @click="createPlaceholder">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <!-- to add extra space for the FAB if the user scrolled to the bottom of the page-->
        <div style="height: 60px;"></div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Question from '@/components/quizzes/admins/Question.vue'
import api from "@/gateways/api";
import AppBar from "@/components/utils/AppBar";

export default {
  name: "Quiz",
  components: {
    AppBar,
    Question,
  },
  data() {
    return {
      questions: [],
      admin: true,
      placeholderExists: false,
      quiz: null,
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
      })
    },
    createPlaceholder() {
      if (this.placeholderExists) {
        this.$store.dispatch('viewErrorSnackbar', 'Please fill the unfinished one first')
      } else {
        this.placeholderExists = true;
        this.$vuetify.goTo(0)
      }

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
        if (options.id === question.question.ID) {
          this.questions.splice(index, 1)
        }
      })
    }
  },
  mounted() {
    this.getQuiz().then((response) => {
      this.quiz = response.data.quiz
      this.getQuestions()
    })
  }
};
</script>