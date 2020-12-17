<template>
  <v-app>
    <AppBar page-name="Quiz"></AppBar>
    <v-main>
      <v-container>
        <!--        <Question v-if="placeholderExists" :isNew="true"-->
        <!--                  @deleteNewQuestion="deleteNewQuestion"-->
        <!--                  @placeholderFilled="placeholderFilled"-->
        <!--                  :quiz="quiz"-->
        <!--                  :admin="admin">-->
        <!--        </Question>-->

        <v-row>
          <v-col cols="12" md="9">
            <Question
                v-if="fetch.questions && fetch.quiz"
                :question="questions[selectedQuestion]"
                :quiz="quiz"
                :is-new.sync="newQuestion"
                :edit-mode.sync="editMode"
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
      placeholderExists: false,
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
        this.fetch.questions = true
      })
    },
    createPlaceholder() {
      if (this.placeholderExists) {
        this.$store.dispatch('viewErrorSnackbar', 'Please fill the unfinished one first')
      } else {
        this.placeholderExists = true
        this.editMode = true
        this.newQuestion = true
        this.questions.push({
          question: {},
        })
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
      this.fetch.quiz = true
      this.getQuestions()
    })
  }
};
</script>