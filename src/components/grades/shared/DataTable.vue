<template>
  <v-data-table
      :headers="headers"
      :items="grades"
      item-key="user.username"
      class="elevation-1"
      :loading="loading"
      :search="search"
      single-expand
      :expanded.sync="expanded"
      show-expand
      :footer-props="{
        'show-current-page': true,
        'show-first-last-page': true,
      }"
  >
    <template v-slot:top>
      <v-row>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-col cols="2" align="right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on"
                       v-if="userData.admin" icon
                       :loading="loadingPDF" @click="getGradesPDF">
                  <v-icon large>mdi-pdf-box</v-icon>
                </v-btn>
              </template>
              <span>Download as PDF</span>
            </v-tooltip>
          </v-col>
          <v-col cols="5" sm="3">
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
          <v-col cols="5" sm="3" v-if="userData.admin">
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
        Phone Number: {{ item.user.phoneNumber }}
        <v-spacer></v-spacer>
        Parent Number: {{ item.user.parentNumber }}
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
    loadingPDF: false,
  }),

  computed: {
    url() {
      if (this.userData.admin)
        return "admin/quizzes/grades/month"
      else
        return "quizzes/grades/month"
    },
    ...mapState(['userData', 'classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },

  watch: {
    selectedClass() {
      this.getAllGrades()
    }
  },
  methods: {
    saveMonth() {
      this.$refs.menu.save(this.date)
      this.getAllGrades()
    },
    getAllGrades() {
      this.loading = true
      api({
        method: "GET",
        url: this.url,
        params: {
          "month": new Date(this.date).getTime(),
        }
      }).then(response => {
        this.headers = [
          {text: '', value: 'data-table-expand'},
          {text: 'Full Name', value: 'user.fullName'},
        ]
        this.quizzesTotalMarks = response.data.quizzesTotalMarks
        this.grades = response.data.grades
        this.quizzes = response.data.quizzes
        this.quizzes.forEach(quiz => {
          if (this.$vuetify.breakpoint.mdAndUp)
            this.headers.push({text: `${quiz.title}`, value: quiz.ID.toString()})
          else
            this.headers.push({text: `${quiz.title} (${quiz.totalMark})`, value: quiz.ID.toString()})

        })
        this.headers.push({text: 'Total', value: 'total'})
      }).finally(() => {
        this.loading = false
      })
    },
    getGradesPDF() {
      this.loadingPDF = true
      api({
        method: "GET",
        url: "/admin/quizzes/grades/month/pdf",
        responseType: 'blob',
        params: {
          month: new Date(this.date).getTime()
        }
      }).then(response => {
        let url = URL.createObjectURL(response.data)
        window.open(url, "_blank")
      }).catch(() => {
        this.$store.dispatch('viewErrorSnackbar', 'Unexpected error occurred, please try again later')
      }).finally(() => {
        this.loadingPDF = false
      })
    },
  },
  created() {
    this.getAllGrades()
  }
}
</script>