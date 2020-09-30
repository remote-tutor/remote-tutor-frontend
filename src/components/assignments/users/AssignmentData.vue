<template>
  <div>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">

          <v-card-text>
            <v-card-title>{{ assignment.title }}</v-card-title>
          </v-card-text>
          <v-card-subtitle>
            Deadline: {{ assignment.deadline | moment }} ({{ assignment.deadline | momentFromNow }})
          </v-card-subtitle>
          <v-row>
            <v-col cols="12" md="6">
              <v-btn outlined v-if="assignment.questions.length > 0">
                <a :loading="loadingQuestions" :href="assignment.questionsDownloadLink"
                   :download="assignment.questionsFileName" class="download-link">
                  Download Questions
                  <v-icon>mdi-cloud-download</v-icon>
                </a>
              </v-btn>
              <div v-else>We couldn't find the questions file for this assignment</div>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn outlined v-if="showModelAnswer">
                <a :loading="loadingModelAnswer" :href="assignment.modelAnswerDownloadLink"
                   :download="assignment.modelAnswerFileName" class="download-link">
                  Download Model Answer
                  <v-icon>mdi-cloud-download</v-icon>
                </a>
              </v-btn>
              <div v-else-if="assignment.modelAnswerPeriod === 0">
                The model answer will be available immediately after the deadline (if found)
              </div>
              <div v-else>
                The model answer will be available after the deadline by {{ assignment.modelAnswerPeriod }} hour(s) (if found)
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-file-input
                  chips
                  show-size
                  label="Submission"
                  hint="If you updated the submission, the previous one will be deleted"
                  persistent-hint
                  prepend-icon="mdi-format-list-text"
                  v-model="submission.bytes"
              ></v-file-input>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="pushSubmission" :loading="loading" :disabled="submission.bytes.length === 0">
              Add Submission
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import api from "@/gateways/api";
import moment from "moment"

export default {
  name: "AssignmentData",
  data() {
    return {
      loading: false,
      loadingQuestions: false,
      loadingModelAnswer: false,
      showModelAnswer: false,
      assignment: {
        title: '',
        deadline: '',
        modelAnswerPeriod: 1,
        questions: '',
        modelAnswer: '',
      },
      submission: {
        bytes: [],
        fullLink: "",
        downloadLink: "",
        fileName: "",
      },
    }
  },
  created() {
    api({
      method: "GET",
      url: "/assignments/assignment",
      params: {
        assignmentID: this.$route.params.assignmentID
      }
    }).then(response => {
      this.assignment = response.data.assignment
      this.getFile(this.assignment.questions, true)

      this.showModelAnswer = moment(this.assignment.deadline)
          .add(this.assignment.modelAnswerPeriod, 'hours')
          .isBefore(moment(), 'hour')
      if (this.showModelAnswer) // check if the modelAnswerPeriod has passed before retrieving the modelAnswer
        this.getFile(this.assignment.modelAnswer, false)

    })
  },
  methods: {
    getFile(fullPath, questionsFile) {
      if (fullPath === "")
        return
      (questionsFile) ? this.loadingQuestions = true : this.loadingModelAnswer = true
      api({
        method: "GET",
        url: "/assignments/assignment/file",
        responseType: 'blob',
        params: {
          file: fullPath
        }
      }).then(response => {
        if (questionsFile) {
          let folders = fullPath.split("/questionsFile/")
          this.assignment.questionsFileName = folders[folders.length - 1]
          this.assignment.questionsDownloadLink = URL.createObjectURL(new Blob([response.data]));
        } else {
          let folders = fullPath.split("/modelAnswerFile/")
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
    pushSubmission() {
      this.loading = true
      let formData = new FormData()
      formData.append("assignmentID", this.$route.params.assignmentID)
      formData.append("submissionFile", this.submission.bytes)
      api({
        method: "POST",
        url: "/assignments/submissions",
        data: formData,
      }).finally(() => {
        this.loading = false
      })
    }
  },
  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
    momentFromNow: function (date) {
      return moment(date, "YYYYMMDD, h:mm a").startOf('minute').fromNow()
    }
  },
}
</script>

<style scoped>
.download-link {
  text-decoration: none !important;
}
</style>