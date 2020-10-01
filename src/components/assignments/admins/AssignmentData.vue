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
            <v-btn outlined v-if="assignment.questions.length > 0" :loading="loadingQuestions"
                   @click="downloadQuestionsFile">
              <a :href="assignment.questionsDownloadLink" id="questions-link"
                 :download="assignment.questionsFileName" class="download-link">
                Questions
                <v-icon>mdi-cloud-download</v-icon>
              </a>
            </v-btn>
            <div v-else>We couldn't find the questions file for this assignment</div>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn outlined v-if="assignment.modelAnswer.length > 0" :loading="loadingModelAnswer"
                   @click="downloadModelAnswerFile">
              <a :href="assignment.modelAnswerDownloadLink" id="model-answer-link"
                 :download="assignment.modelAnswerFileName" class="download-link">
                Download Model Answer
                <v-icon>mdi-cloud-download</v-icon>
              </a>
            </v-btn>
            <div v-else>No model answer associated with this question</div>
          </v-col>
        </v-row>

        <v-btn color="primary" type="submit" block :disabled="invalid" :loading="loading">
          Save Assignment
        </v-btn>
      </form>

    </ValidationObserver>

    <SubmissionsTable :deadline="assignment.deadline"></SubmissionsTable>
  </div>
</template>

<script>
import api from "@/gateways/api";
import SubmissionsTable from "@/components/assignments/admins/SubmissionsTable";

export default {
  name: "AssignmentData",
  components: {SubmissionsTable},
  data() {
    return {
      assignment: {
        CreatedAt: '',
        title: '',
        year: 1,
        deadline: "",
        totalMark: 10,
        modelAnswerPeriod: 1,
        questionsBytes: [],
        modelAnswerBytes: [],
        questions: "",
        modelAnswer: "",
        questionsDownloadLink: "",
        modelAnswerDownloadLink: "",
        questionsFileName: "",
        modelAnswerFileName: "",
      },
      menu: false,
      loading: false,
      loadingQuestions: false,
      loadingModelAnswer: false,
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
        formData.append("CreatedAt", Date.parse(this.assignment.CreatedAt))
      } else {
        method = "POST"
      }

      formData.append("title", this.assignment.title)
      formData.append("year", this.assignment.year)
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
    getFile(fullPath, questionsFile) {
      if (fullPath === "")
        return
      (questionsFile) ? this.loadingQuestions = true : this.loadingModelAnswer = true
      return api({
        method: "GET",
        url: "/assignments/assignment/file",
        responseType: 'blob',
        params: {
          file: fullPath
        }
      }).then(response => {
        let folders = fullPath.split("/")
        if (questionsFile) {
          this.assignment.questionsFileName = folders[folders.length - 1]
          this.assignment.questionsDownloadLink = URL.createObjectURL(new Blob([response.data]));
        } else {
          this.assignment.modelAnswerFileName = folders[folders.length - 1]
          this.assignment.modelAnswerDownloadLink = URL.createObjectURL(new Blob([response.data]));
        }
      }).catch(() => {
        this.$store.dispatch('viewSnackbar', {
          text: 'Sorry we cannot download the requested file now, please try again later',
          color: 'error'
        })
      }).finally(() => {
        (questionsFile) ? this.loadingQuestions = false : this.loadingModelAnswer = false
      })
    },
    downloadQuestionsFile() {
      if (this.assignment.questionsFileName === undefined) {
        this.getFile(this.assignment.questions, true).then(() => {
          document.getElementById("questions-link").click()
        })
      }
    },
    downloadModelAnswerFile() {
      if (this.assignment.modelAnswerFileName === undefined) {
        // check if the modelAnswerPeriod has passed before retrieving the modelAnswer
        this.getFile(this.assignment.modelAnswer, false).then(() => {
          document.getElementById("model-answer-link").click()
        })
      }
    },
  }
}
</script>

<style scoped>
.download-link {
  text-decoration: none !important;
}
</style>