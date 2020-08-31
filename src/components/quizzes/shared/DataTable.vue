<template>
  <v-data-table
      :headers="headers"
      :items="quizzes"
      class="elevation-1"
      :loading="loading"
  >
    <template v-slot:top>

      <v-toolbar flat color="white">
        <v-toolbar-title>
          {{ title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-col>
          <v-select v-if="userData.admin"
                    label="Year"
                    class="mt-5"
                    :items="years"
                    item-text="text"
                    item-value="value"
                    v-model="selectedYear"
                    @input="getQuizzes"
          ></v-select>
        </v-col>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="userData.admin"
                   color="primary"
                   dark
                   class="mb-2"
                   v-bind="attrs"
                   v-on="on">Create Quiz
            </v-btn>
          </template>

          <Quiz :edited-index="editedIndex" :static-quiz="editedQuiz"
                @closeDialog="close" @save="save"></Quiz>

        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.goTo="{item}">
      <v-btn small :to="{ name: 'QuizQuestions', params: {quizID: item.id} }">GO TO</v-btn>
    </template>
    <template v-slot:item.actions="{ item }" v-if="userData.admin">
      <v-icon small class="mr-2" @click="editQuiz(item)" v-if="type === 1">
        mdi-pencil
      </v-icon>
      <ConfirmationDialog v-slot:item.actions="{ item }"
          :datatable="true"
          mainText="Delete Quiz"
          message="You won't be able to restore the deleted quiz or its questions"
          @confirm="deleteQuiz(item)">
      </ConfirmationDialog>
    </template>
  </v-data-table>
</template>

<script>
import api from "@/gateways/api";
import Quiz from "@/components/quizzes/admins/Quiz";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import {mapState} from "vuex";

export default {
  components: {ConfirmationDialog, Quiz},
  props: ['title', 'type'],
  data: () => ({
    loading: false,
    dialog: false,
    years: [
      {text: "First Year", value: 1},
      {text: "Second Year", value: 2},
      {text: "Third Year", value: 3},
    ],
    selectedYear: 1,
    headers: [
      {text: 'Title', sortable: false, value: 'title'},
      {text: 'Go To', sortable: false, value: 'goTo'},
      {text: 'Start At', value: 'formattedStartTime', sortable: false},
      {text: 'End At', value: 'formattedEndTime', sortable: false},
    ],
    quizzes: [],
    editedIndex: -1,
    editedQuiz: {
      text: '',
      startTime: "0",
      endTime: "0",
      year: 0,
    },
  }),

  computed: {
    url() {
      if (this.type === -1) return "/past"
      if (this.type === 0) return "/present"
      if (this.type === 1) return "/future"
      return ""
    },
    ...mapState(['userData']),
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  created() {
    this.getQuizzes()
    this.emptyQuiz = Object.assign(this.editedQuiz, {})
    if (this.userData.admin) {
      this.headers.push({text: 'Actions', value: 'actions', sortable: false})
    }
  },

  methods: {
    getQuizzes() {
      this.loading = true
      api({
        method: "GET",
        url: "/quizzes" + this.url,
        params: {
          year: this.selectedYear
        }
      }).then(result => {
        if (this.type === -1) this.quizzes = result.data.pastQuizzes
        else if (this.type === 0) this.quizzes = result.data.currentQuizzes
        else if (this.type === 1) this.quizzes = result.data.futureQuizzes
        this.formatQuizzes()
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
    formatQuizzes() {
      this.quizzes.forEach((quiz, index) => {
        this.quizzes[index].formattedStartTime = this.formatDate(quiz.startTime)
        this.quizzes[index].formattedEndTime = this.formatDate(quiz.endTime)
      })
      this.quizzes.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime)
      })
    },
    formatDate(value) {
      let date = new Date(value)
      return date.getFullYear() + "/" +
          ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
          ("0" + date.getDate()).slice(-2) + " " +
          ("0" + (date.getHours() % 12 || 12)).slice(-2) + ":" +
          ("0" + date.getMinutes()).slice(-2) + " " +
          ((date.getHours() > 12) ? "PM" : "AM")

    },

    editQuiz(quiz) {
      this.editedIndex = this.quizzes.indexOf(quiz)
      this.editedQuiz = Object.assign({}, quiz)
      this.dialog = true
    },

    deleteQuiz(item) {
      const index = this.quizzes.indexOf(item)
      let formData = new FormData()
      formData.append("id", item.id)
      api({
        method: "DELETE",
        url: "/admin/quizzes",
        data: formData
      }).catch(error => {
        console.log(error)
      })
      this.quizzes.splice(index, 1)
    },

    close() {
      this.dialog = false
      this.editedIndex = -1
      this.editedQuiz = this.emptyQuiz
    },

    save(options) {
      if (this.editedIndex > -1) {
        Object.assign(this.quizzes[this.editedIndex], options.quiz)
      } else {
        this.quizzes.unshift(options.quiz)
        this.$router.push({name: 'QuizQuestions', params: {quizID: options.quiz.id}})
      }
      this.formatQuizzes()
      this.close()
    },
  },
}
</script>