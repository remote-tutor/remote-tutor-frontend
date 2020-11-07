<template>
  <v-data-table
      :headers="headers"
      :items="quizzes"
      class="elevation-1"
      :loading="loading"
      disable-sort
      :options.sync="options"
      :server-items-length="totalQuizzes"
      :footer-props="{
        'items-per-page-options': [10, 15, 20],
        'show-current-page': true,
        'show-first-last-page': true,
      }"
      :items-per-page="10"
  >
    <template v-slot:top>

      <v-toolbar flat color="white">
        <v-toolbar-title>
          {{ title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
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
      <v-btn small :to="{ name: 'QuizQuestions', params: {quizHash: item.hash} }">GO TO</v-btn>
    </template>
    <template v-slot:item.start="{item}">
      <v-btn small @click="solve(item)" v-if="item.access">Start</v-btn>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>You don't have access to take this quiz. If you think there's an error, please contact the administrator</span>
      </v-tooltip>
    </template>

    <template v-slot:item.review="{item}">
      <v-btn small @click="review(item)" v-if="item.access">Review</v-btn>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>You don't have access to review this quiz. If you think there's an error, please contact the administrator</span>
      </v-tooltip>
    </template>

    <template v-slot:item.access="{item}">
      <v-tooltip bottom v-if="item.access">
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="green" dark v-bind="attrs" v-on="on">mdi-check-bold</v-icon>
        </template>
        <span>You could take this quiz when it starts</span>
      </v-tooltip>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>You don't have access to take this quiz. If you think there's an error, please contact the administrator</span>
      </v-tooltip>
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
    options: {},
    totalQuizzes: 0,
    headers: [
      {text: 'Title', value: 'title'},
      {text: 'Start At', value: 'formattedStartTime'},
      {text: 'End At', value: 'formattedEndTime'},
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
      if (this.type === 0) return "/current"
      if (this.type === 1) return "/future"
      return ""
    },
    ...mapState(['userData', 'classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.getQuizzes();
      },
      deep: true,
    },
    selectedClass() {
      this.options.page = 1
      this.getQuizzes()
    }
  },

  created() {
    this.emptyQuiz = Object.assign(this.editedQuiz, {})
    if (this.userData.admin) {
      this.headers.push({text: 'Actions', value: 'actions'})
      this.headers.splice(1, 0, {text: 'Go To', value: 'goTo'})
    } else {
      if (this.type === 1) {
        this.headers.splice(1, 0, {text: 'Access', value: 'access'})
      } else if (this.type === 0) {
        this.headers.splice(1, 0, {text: 'Start', value: 'start'})
      } else if (this.type === -1) {
        this.headers.splice(1, 0, {text: 'Review', value: 'review'})
      }
    }
  },
  mounted() {
    this.getQuizzes()
  },
  methods: {
    getQuizzes() {
      this.loading = true
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      api({
        method: "GET",
        url: "/quizzes" + this.url,
        params: {
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: sortBy,
          sortDesc: sortDesc,
        }
      }).then(async response => {
        this.totalQuizzes = response.data.totalQuizzes
        if (this.type === -1) this.quizzes = response.data.pastQuizzes
        else if (this.type === 0) this.quizzes = response.data.currentQuizzes
        else if (this.type === 1) this.quizzes = response.data.futureQuizzes
        this.formatQuizzes()

        let quizzesPermissions = []
        this.quizzes.forEach(quiz => {
          quizzesPermissions.push(this.getQuizPermission(quiz))
        })
        await Promise.all(quizzesPermissions)
            .then(response => {
              this.quizzes.forEach((quiz, index) => {
                this.quizzes[index].access = response[index].data.status
              })
            })
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
    getQuizPermission(quiz) {
      return api({
        method: "GET",
        url: "/payments/week",
        params: {
          eventDate: new Date(quiz.startTime).getTime()
        }
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
      formData.append("id", item.ID)
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
        this.$router.push({name: 'QuizQuestions', params: {quizHash: options.quiz.hash}})
      }
      this.formatQuizzes()
      this.close()
    },
    solve(item) {
      this.$router.push({name: 'SolveQuiz', params: {action: 'solve', quizHash: item.hash}})
    },
    review(item) {
      this.$router.push({name: 'SolveQuiz', params: {action: 'review', quizHash: item.hash}})
    },
  },
}
</script>