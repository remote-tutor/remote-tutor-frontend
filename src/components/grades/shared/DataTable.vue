<template>
  <v-data-table
      :headers="headers"
      :items="grades"
      class="elevation-1"
      :loading="loading"
      multi-sort
      :sort-by="['fullName']"
      dense
      :search="search"
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
            <v-select
                label="Year"
                class="mt-5"
                :items="years"
                item-text="text"
                item-value="value"
                v-model="selectedYear"
                @input="getQuizzesGrades"
            ></v-select>
          </v-col>

        </v-toolbar>
      </v-row>
    </template>
    <template v-slot:header v-if="userData.admin">
      <thead>
      <tr>
        <th :colspan="headers.length">
          <v-col cols="10">
            <v-text-field
                v-model="search"
                prepend-icon="mdi-magnify"
                clearable
                label="Search"
                single-line
                hide-details
            ></v-text-field>
          </v-col>
        </th>
      </tr>
      </thead>
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
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    years: [
      {text: "First Year", value: 1},
      {text: "Second Year", value: 2},
      {text: "Third Year", value: 3},
    ],
    selectedYear: 1,
    headers: [],
    grades: [],
  }),

  computed: {
    url() {
      if (this.userData.admin)
        return "admin/quizzes/grades"
      else
        return "quizzes/grades"
    },
    ...mapState(['userData']),
  },

  methods: {
    saveMonth() {
      this.$refs.menu.save(this.date)
      this.getQuizzesGrades()
    },
    async getQuizzesGrades() {
      this.loading = true
      let result = await api({
        method: "GET",
        url: "quizzes/month",
        params: {
          year: this.selectedYear,
          date: new Date(this.date).getTime(),
        }
      })
      let quizzes = result.data.quizzes
      let headers = [{text: 'Full Name', value: 'fullName'}]

      let gradesMap = new Map()
      for (let i = 0; i < quizzes.length; i++) {
        let quiz = quizzes[i]
        headers.push({text: `${quiz.title} #${i + 1}`, value: quiz.id.toString()})
        await api({
          method: "GET",
          url: this.url,
          params: {
            quizID: quiz.id
          }
        }).then(response => {
          let usersGrades = (this.userData.admin) ? response.data.quizGrades : response.data.quizGrade
          usersGrades.forEach((userGrade) => {
            if (!gradesMap.has(userGrade.user.username))
              gradesMap.set(userGrade.user.username, {
                fullName: userGrade.user.full_name,
                total: 0
              })
            let userGrades = gradesMap.get(userGrade.user.username)
            userGrades[`${quiz.id}`] = userGrade.grade
            userGrades.total += userGrade.grade
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