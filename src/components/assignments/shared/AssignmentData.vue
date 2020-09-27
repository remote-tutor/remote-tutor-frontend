<template>
  <div>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="createAssignment">
        <v-row>
          <v-col cols="12" md="6">
            <ValidationProvider v-slot="{errors}" rules="required">
              <v-text-field
                  label="Title"
                  prepend-icon="mdi-format-title"
                  type="text"
                  v-model="assignment.title"
                  :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
          </v-col>
          <v-col cols="12" md="6">
            <v-select label="Year"
                      :items="years"
                      item-text="text"
                      item-value="value"
                      v-model="assignment.year"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-icon>mdi-calendar</v-icon>
            <span>Deadline</span>
            <Datetime
                type="datetime"
                use12-hour
                input-class="rounded-0 grey lighten-3"
                v-model="assignment.deadline"
                :min-datetime="new Date().toISOString()"
            ></Datetime>
            <ValidationProvider rules="required" v-slot="{errors}">
              <input v-model="assignment.deadline" v-show="false"/>
              <div class="red--text">{{ errors[0] }}</div>
            </ValidationProvider>
          </v-col>
          <v-col cols="6">
            <ValidationProvider v-slot="{errors}" rules="required|numeric">
              <v-text-field
                  label="Total Mark"
                  prepend-icon="mdi-sticker-check"
                  type="text"
                  v-model="assignment.totalMark"
                  :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-file-input
                chips
                show-size
                label="Questions"
                prepend-icon="mdi-format-list-text"
                v-model="assignment.questionsBytes"
            ></v-file-input>
          </v-col>

          <v-col cols="12" md="4">
            <v-file-input
                chips
                show-size
                label="Model Answer"
                prepend-icon="mdi-format-list-text"
                :hint="'This file will be shown AFTER the deadline by ' +  assignment.hours  + ' hour(s)'"
                persistent-hint
                v-model="assignment.modelAnswerBytes"
            ></v-file-input>
          </v-col>

          <v-col cols="12" md="4">
            <v-select label="Show Model Answer After"
                      :items="hoursToDisplayModelAnswer"
                      v-model="assignment.modelAnswerPeriod"
            ></v-select>
          </v-col>
        </v-row>
        <v-btn color="primary" type="submit" block :disabled="invalid" :loading="loading">
          Save Assignment
        </v-btn>
      </form>

    </ValidationObserver>
  </div>
</template>

<script>
import api from "@/gateways/api";

export default {
  name: "AssignmentData",
  data() {
    return {
      assignment: {
        title: '',
        year: 1,
        deadline: "",
        totalMark: 10,
        modelAnswerPeriod: 1,
        questionsBytes: [],
        modelAnswerBytes: [],
        questions: "",
        modelAnswer: "",
      },
      menu: false,
      loading: false,
      years: [
        {text: "First Year", value: 1},
        {text: "Second Year", value: 2},
        {text: "Third Year", value: 3},
      ],
      hoursToDisplayModelAnswer: [0, 1, 2, 3, 6, 12]
    }
  },
  created() {
    let assignmentID = this.$route.params.assignmentID
    if (assignmentID <= 0)
      return
    api({
      method: "GET",
      url: "/assignments/assignment",
      params: {
        assignmentID: this.$route.params.assignmentID
      }
    }).then(response => {
      this.assignment = response.data.assignment
    })
  },
  methods: {
    createAssignment() {
      this.loading = true
      let assignmentID = this.$route.params.assignmentID
      let formData = new FormData()
      let method = ""
      if (assignmentID > 0) {
        method = "PUT"
        formData.append("id", assignmentID)
      } else {
        method = "POST"
      }

      formData.append("title", this.assignment.title)
      formData.append("year", this.assignment.year)
      formData.append("deadline", Date.parse(this.assignment.deadline))
      formData.append("totalMark", this.assignment.totalMark)
      formData.append("modelAnswerPeriod", this.assignment.modelAnswerPeriod)
      formData.append("questions", this.assignment.questionsBytes)
      formData.append("modelAnswer", this.assignment.modelAnswerBytes)
      api({
        method: method,
        url: '/admin/assignments',
        data: formData,
      }).then(() => {
        this.$router.push({name: 'Assignments'})
      })
      .catch(err => console.log(err))
      .finally(() => {
        this.loading = false
      })
    },
  }
}
</script>

<style scoped>

</style>