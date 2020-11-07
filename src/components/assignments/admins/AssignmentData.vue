<template>
  <div>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="createAssignment">
        <v-row>
          <v-col cols="12" sm="6">
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

          <v-col cols="6" sm="3">
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
          <v-col cols="6" sm="3">
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
                :hint="'This file will be shown AFTER the deadline by ' +  assignment.modelAnswerPeriod  + ' hour(s)'"
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

        <v-row>
          <v-col cols="12" md="6">
            <v-btn outlined v-if="assignment.questions.length > 0"
                   @click="getUrl(questionsLoading, assignment.questions)" :loading="questionsLoading.value">
              Questions
              <v-icon>mdi-cloud-download</v-icon>
            </v-btn>
            <div v-else>We couldn't find the questions file for this assignment</div>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn outlined v-if="assignment.modelAnswer.length > 0"
                   @click="getUrl(answersLoading, assignment.modelAnswer)" :loading="answersLoading.value">
              Model Answer
              <v-icon>mdi-cloud-download</v-icon>
            </v-btn>
            <div v-else>No model answer associated with this question</div>
          </v-col>
        </v-row>

        <v-btn color="primary" type="submit" block :disabled="invalid" :loading="loading">
          Save Assignment
        </v-btn>
      </form>

    </ValidationObserver>

    <SubmissionsTable :deadline="assignment.deadline" :total-mark="assignment.totalMark"></SubmissionsTable>
  </div>
</template>

<script>
import api from "@/gateways/api";
import SubmissionsTable from "@/components/assignments/admins/SubmissionsTable";
import {mapState} from "vuex";
import {getSignedUrl} from '@/components/assignments/shared/signedUrl';

export default {
  name: "AssignmentData",
  components: {SubmissionsTable},
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    },
  },
  watch: {
    selectedClass() {
      this.$router.push({name: 'Assignments'})
    }
  },
  data() {
    return {
      assignment: {
        CreatedAt: '',
        title: '',
        deadline: "",
        totalMark: 10,
        modelAnswerPeriod: 1,
        questionsBytes: [],
        modelAnswerBytes: [],
        questions: "",
        modelAnswer: "",
      },
      loading: false,
      questionsLoading: {value: false},
      answersLoading: {value: false},
      hoursToDisplayModelAnswer: [0, 1, 2, 3, 6, 12]
    }
  },
  created() {
    let assignmentHash = this.$route.params.assignmentHash
    if (assignmentHash <= 0)
      return
    api({
      method: "GET",
      url: "/assignments/assignment",
      params: {
        assignmentHash: this.$route.params.assignmentHash
      }
    }).then(response => {
      this.assignment = response.data.assignment
    })
  },
  methods: {
    createAssignment() {
      this.loading = true
      let assignmentID = this.assignment.ID
      let formData = new FormData()
      let method = ""
      if (assignmentID > 0) {
        method = "PUT"
        formData.append("id", assignmentID)
        formData.append("hash", this.assignment.hash)
      } else {
        method = "POST"
      }

      formData.append("title", this.assignment.title)
      formData.append("selectedClass", this.selectedClass)
      formData.append("deadline", Date.parse(this.assignment.deadline))
      formData.append("totalMark", this.assignment.totalMark)
      formData.append("modelAnswerPeriod", this.assignment.modelAnswerPeriod)
      formData.append("questions", this.assignment.questions)
      formData.append("questionsFile", this.assignment.questionsBytes)
      formData.append("modelAnswer", this.assignment.modelAnswer)
      formData.append("modelAnswerFile", this.assignment.modelAnswerBytes)
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
    getUrl(loading, link) {
      getSignedUrl(this, loading, link)
    },
  }
}
</script>

<style scoped>
.download-link {
  text-decoration: none !important;
}
</style>