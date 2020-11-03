<template>
  <v-data-table
      :headers="headers"
      :items="grades"
      item-key="fullName"
      class="elevation-1"
      :loading="loading"
      :search="search"
      single-expand
      :expanded.sync="expanded"
      show-expand
  >
    <template v-slot:top>
      <v-row>
        <v-toolbar flat color="white">
          <v-toolbar-title>
            {{ title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-col cols="6" sm="3">
            <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="scale-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    class="mt-5"
                    v-model="date"
                    label="Month"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="date"
                  type="month"
                  no-title
                  scrollable>
                <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="primary" @click="saveMonth">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="6" sm="3" v-if="userData.admin">
            <v-text-field
                v-model="search"
                prepend-icon="mdi-magnify"
                clearable
                label="Search"
                single-line
                hide-details
            ></v-text-field>
          </v-col>

        </v-toolbar>
      </v-row>
    </template>

    <template v-slot:body.prepend="{}" v-if="$vuetify.breakpoint.smAndUp && headers.length > 0">
      <tr>
        <td colspan="2">Total Mark</td>
        <td v-for="quiz in quizzes"
            :key="quiz.ID"
        >
          {{ quiz.totalMark }}
        </td>
        <td>{{ quizzesTotalMarks }}</td>
      </tr>
    </template>

    <template v-slot:expanded-item="{headers, item}">
      <td :colspan="headers.length">
        Phone Number: {{ item.phoneNumber }}
        <v-spacer></v-spacer>
        Parent Number: {{ item.parentNumber }}
      </td>

    </template>

  </v-data-table>
</template>

<script>
import {mapState} from "vuex";
import api from "@/gateways/api";

export default {
  name: 'DataTable',
  props: ['title'],
  data: () => ({
    loading: false,
    search: '',
    dialog: false,
    expanded: [],
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    headers: [],
    grades: [],
    quizzes: [],
    quizzesTotalMarks: 0,
  }),

  computed: {
    url() {
      if (this.userData.admin)
        return "admin/quizzes/grades"
      else
        return "quizzes/grades"
    },
    ...mapState(['userData', 'classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },

  watch: {
    selectedClass() {
      this.getQuizzesGrades()
    }
  },
  methods: {
    saveMonth() {
      this.$refs.menu.save(this.date)
      this.getQuizzesGrades()
    },
    async getQuizzesGrades() {
      this.headers = []
      this.grades = []
      this.quizzesTotalMarks = 0
      this.loading = true
      let result = await api({
        method: "GET",
        url: "quizzes/month",
        params: {
          date: new Date(this.date).getTime(),
        }
      })
      this.quizzes = result.data.quizzes
      this.quizzes.forEach(quiz => {
        this.quizzesTotalMarks += quiz.totalMark
      })
      let headers = [{text: '', value: 'data-table-expand'}, {text: 'Full Name', value: 'fullName'}]

      let gradesMap = new Map()
      for (let i = 0; i < this.quizzes.length; i++) {
        let quiz = this.quizzes[i]
        if (this.$vuetify.breakpoint.mdAndUp)
          headers.push({text: `${quiz.title} #${i + 1}`, value: quiz.ID.toString()})
        else
          headers.push({text: `${quiz.title} #${i + 1} (${quiz.totalMark})`, value: quiz.ID.toString()})
        await api({
          method: "GET",
          url: this.url,
          params: {
            quizID: quiz.ID
          }
        }).then(response => {
          let usersGrades = (this.userData.admin) ? response.data.quizGrades : response.data.quizGrade
          usersGrades.forEach((userGrade) => {
            if (userGrade.userID !== 0) {
              if (!gradesMap.has(userGrade.user.username))
                gradesMap.set(userGrade.user.username, {
                  fullName: userGrade.user.fullName,
                  phoneNumber: userGrade.user.phoneNumber,
                  parentNumber: userGrade.user.parentNumber,
                  total: 0
                })
              let userGrades = gradesMap.get(userGrade.user.username)
              userGrades[`${quiz.ID}`] = userGrade.grade
              userGrades.total += userGrade.grade
            }
          })
        })
      }
      let grades = []
      gradesMap.forEach(value => {
        grades.push(value)
      })
      headers.push({text: 'Total', value: 'total'})
      this.headers = headers.slice()
      this.grades = grades.slice()
      this.loading = false
    },
  },
  created() {
    this.getQuizzesGrades()
  }
}
</script>