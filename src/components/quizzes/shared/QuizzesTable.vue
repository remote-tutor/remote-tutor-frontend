<template>
  <div>


  <v-data-table
      :headers="headers"
      :items="quizzes"
      class="elevation-1"
      :loading="loading"
      disable-sort
      sort-by="start_time"
      sort-desc
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

    <template v-slot:item.startTime="{item}">
      {{ item.startTime | momentFormatDate }}
    </template>

    <template v-slot:item.endTime="{item}">
      {{ item.endTime | momentFormatDate }}
    </template>

    <template v-slot:item.remainingTime="{item}">
      <span v-if="!item.started">Start Now!</span>
      <span v-else>
        <Timer :end-time="item.remainingTime" :simple="true"></Timer>
      </span>
    </template>

    <template v-slot:item.goTo="{item}">
      <v-btn small :to="{ name: 'QuizQuestions', params: {quizHash: item.hash} }">GO TO</v-btn>
    </template>
    <template v-slot:item.start="{item}">
      <v-icon color="green" @click="confirmQuizStart(item)" v-if="item.timeAvailable && item.access">mdi-clock-start</v-icon>

      <v-tooltip bottom v-else-if="!item.timeAvailable">
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" v-bind="attrs" v-on="on">mdi-timer-off</v-icon>
        </template>
        <span>You've consumed your available time. The grade will be revealed after the end time for the quiz</span>
      </v-tooltip>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="red" dark v-bind="attrs" v-on="on">mdi-close-circle</v-icon>
        </template>
        <span>You don't have access to take this quiz. If you think there's an error, please contact the administrator</span>
      </v-tooltip>
    </template>

    <template v-slot:item.review="{item}">
      <v-tooltip bottom v-if="item.access">
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="green" v-bind="attrs" v-on="on" @click="review(item)">mdi-star-check</v-icon>
        </template>
        <span>Review quiz model answer</span>
      </v-tooltip>

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

    <template v-slot:item.studentTime="{item}">
      <span v-if="item.studentTime / 60 >= 1">{{ Math.floor(item.studentTime / 60) }}H</span>
      <span v-if="item.studentTime / 60 >= 1 && item.studentTime % 60 >= 1">: </span>
      <span v-if="item.studentTime % 60 >= 1">{{ item.studentTime % 60 }}M</span>
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
  <v-dialog v-model="dialogStartQuiz" width="500" v-if="dialogStartQuiz">
    <v-card>
      <v-card-title class="headline">
        Start Quiz Now ?
      </v-card-title>
      <v-card-subtitle>Title: {{ newQuizToStart.title }}</v-card-subtitle>
      <v-card-text>
        Are you sure you want to start the quiz ?
        <br>
        You'll have {{ newQuizToStart.studentTime }} minutes to submit your answers
        <br>
        The timer will start immediately after you click the button below
        <br>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text @click="dialogStartQuiz = false">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="solve(newQuizToStart)">
          Yes Start it Now!
          <v-icon>mdi-clock-start</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script>
import api from "@/gateways/api";
import Quiz from "@/components/quizzes/admins/Quiz";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import {mapState} from "vuex";
import moment from 'moment'
import Timer from "@/components/utils/Timer";
import current_static_quizzes from "@/static-data/current-quizzes.json"

export default {
  components: {Timer, ConfirmationDialog, Quiz},
  props: ['title', 'type'],
  data: () => ({
    loading: false,
    dialog: false,
    dialogStartQuiz: false,
    newQuizToStart: null,
    options: {},
    totalQuizzes: 0,
    headers: [
      {text: 'Title', value: 'title'},
      {text: 'Max Time', value: 'studentTime'},
      {text: 'Start At', value: 'startTime'},
      {text: 'End At', value: 'endTime'},
    ],
    quizzes: [],
    editedIndex: -1,
    editedQuiz: {
      text: '',
      startTime: "0",
      endTime: "0",
      studentTime: 30,
    },
  }),

  computed: {
    url() {
      if (this.type === -1) return "/past"
      if (this.type === 0) return "/current"
      if (this.type === 1) return "/future"
      return ""
    },
    ...mapState(['userData', 'classes', 'isLoggedIn']),
    selectedClass() {
      if(this.isLoggedIn)
        return this.classes.values[this.classes.selectedClass].classHash
      else
        return ""
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
        this.headers.splice(2, 0, {text: 'Remaining Time', value: 'remainingTime'},)
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
      if(this.isLoggedIn) {
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
        }).then(response => {
          this.totalQuizzes = response.data.totalQuizzes
          if (this.type === -1) this.quizzes = response.data.pastQuizzes
          else if (this.type === 0) this.quizzes = response.data.currentQuizzes
          else if (this.type === 1) this.quizzes = response.data.futureQuizzes

          let quizzesPermissions = []
          let studentRemainingTime = []
          this.quizzes.forEach(quiz => {
            quizzesPermissions.push(this.getQuizPermission(quiz))
            studentRemainingTime.push(this.geStudentRemainingTime(quiz))
          })
          let allPromises = [
            Promise.all(quizzesPermissions)
                .then(response => {
                  this.quizzes.forEach((quiz, index) => {
                    this.quizzes[index].access = response[index].data.status
                  })
                }),
          ]
          if (this.type === 0)
            allPromises.push(
                Promise.all(studentRemainingTime).then(response => {
                  this.quizzes.forEach((quiz, index) => {
                    if (response[index].data.recordFound) {
                      this.quizzes[index].started = true
                      this.quizzes[index].timeAvailable =
                          (new Date(response[index].data.studentTime).getTime() >= new Date().getTime())
                      this.quizzes[index].remainingTime = response[index].data.studentTime
                    } else {
                      this.quizzes[index].started = false
                      this.quizzes[index].timeAvailable = true
                    }
                  })
                }),
            )
          return Promise.allSettled(allPromises)
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          this.loading = false
        })
      } else { // to display static data - not important to application logic
        if(this.type === 0) {
          this.quizzes = current_static_quizzes.current
          this.totalQuizzes = this.quizzes.length
          this.quizzes = this.quizzes.map(staticQuiz => {
            let currentDate = new Date()
            return {
              ...staticQuiz,
              startTime: new Date().setDate(currentDate.getDate() - staticQuiz.daysMargin), // add days margin variable
              endTime: new Date().setDate(currentDate.getDate() + staticQuiz.daysMargin),
              remainingTime: new Date().setMinutes(currentDate.getMinutes() + staticQuiz.consumedMinutes) // subtract consumed minutes from the total time
            }
          })
        } else if (this.type === 1) {
          this.quizzes = current_static_quizzes.upcoming
          this.totalQuizzes = this.quizzes.length
          this.quizzes = this.quizzes.map(staticQuiz => {
            let currentDate = new Date()
            return {
              ...staticQuiz,
              startTime: new Date().setDate(currentDate.getDate() + staticQuiz.startDaysMargin), // add days margin variable
              endTime: new Date().setDate(currentDate.getDate() + staticQuiz.endDaysMargin),
            }
          })
        } else if (this.type === -1) {
          this.quizzes = current_static_quizzes.past
          this.totalQuizzes = this.quizzes.length
          this.quizzes = this.quizzes.map(staticQuiz => {
            let currentDate = new Date()
            return {
              ...staticQuiz,
              startTime: new Date().setDate(currentDate.getDate() - staticQuiz.startDaysMargin), // add days margin variable
              endTime: new Date().setDate(currentDate.getDate() - staticQuiz.endDaysMargin),
            }
          })
        }
      }
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
    geStudentRemainingTime(quiz) {
      return api({
        method: "GET",
        url: "/quizzes/grades/time",
        params: {
          quizID: quiz.ID
        }
      })
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
      this.close()
    },
    solve(item) {
      this.$router.push({name: 'SolveQuiz', params: {action: 'solve', quizHash: item.hash}})
    },
    review(item) {
      this.$router.push({name: 'SolveQuiz', params: {action: 'review', quizHash: item.hash}})
    },
    confirmQuizStart(item) {
      if (item.started)
        this.solve(item)
      else {
        this.newQuizToStart = item
        this.dialogStartQuiz = true
      }
    },
  },
  filters: {
    momentFormatDate: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  }
}
</script>