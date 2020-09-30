<template>
  <div>
    <v-row align="start" justify="start">
      <v-col cols="12" md="6">
        <v-card class="elevation-12">
          <v-card-title>
            {{ assignment.title }}
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn small fab v-on="on" color="primary">
                  {{ assignment.totalMark }}
                </v-btn>
              </template>
              <span>Total Mark</span>
            </v-tooltip>
          </v-card-title>
          <v-card-subtitle>
            Deadline: {{ assignment.deadline | moment }} ({{ assignment.deadline | momentFromNow }})
          </v-card-subtitle>
          <v-card-text>
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
                <v-btn outlined v-if="showModelAnswer" :loading="loadingModelAnswer"
                       @click="downloadModelAnswerFile">
                  <a :href="assignment.modelAnswerDownloadLink" id="model-answer-link"
                     :download="assignment.modelAnswerFileName" class="download-link">
                    Model Answer
                    <v-icon>mdi-cloud-download</v-icon>
                  </a>
                </v-btn>
                <div v-else-if="assignment.modelAnswerPeriod === 0">
                  The model answer will be available immediately after the deadline (if found)
                </div>
                <div v-else>
                  The model answer will be available after the deadline by {{ assignment.modelAnswerPeriod }} hour(s)
                  (if found)
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="elevation-12">
          <v-card-title>Your Submission</v-card-title>
          <v-card-subtitle>
            <div v-if="submission.userID !== 0 && submission.assignmentID !== 0">
              Submitted At: {{ submission.uploadedAt | moment }}
              ({{ assignment.deadline | momentDifference(submission.uploadedAt) }})
            </div>
            <div v-else>You haven't submitted a solution yet</div>
          </v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <div v-if="submission.userID === 0 && submission.assignmentID === 0">
                  Status: No Submission Found
                </div>
                <div v-else-if="submission.graded">
                  Status: Graded
                </div>
                <div v-else>
                  Status: Pending for Grading
                </div>
              </v-col>
              <v-col cols="6" v-if="submission.graded">
                Mark: {{ submission.mark }} / {{ assignment.totalMark }}
              </v-col>
            </v-row>

            <v-row v-if="submission.userID !== 0 && submission.assignmentID !== 0">
              <v-col cols="12">
                <v-btn outlined>
                  <a :loading="loadingSubmission" :href="submission.downloadLink"
                     :download="submission.fileName" class="download-link">
                    Your Submission
                    <v-icon>mdi-cloud-download</v-icon>
                  </a>
                </v-btn>
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="pushSubmission" :loading="loading" :disabled="submission.bytes === undefined">
              Change Submission
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
      loadingSubmission: false,
      showModelAnswer: false,
      assignment: {
        title: '',
        deadline: '',
        modelAnswerPeriod: 1,
        questions: '',
        modelAnswer: '',
        totalMark: 0,
      },
      submission: {
        userID: 0,
        assignmentID: 0,
        uploadedAt: '',
        mark: 0,
        graded: false,
        file: '',
        feedback: '',
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
      this.showModelAnswer = moment(this.assignment.deadline)
          .add(this.assignment.modelAnswerPeriod, 'hours')
          .isBefore(moment()) && this.assignment.modelAnswer.length > 0
    })
    this.downloadUserSubmissionFile()
  },
  methods: {
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
      if (this.showModelAnswer && this.assignment.modelAnswerFileName === undefined) {
        // check if the modelAnswerPeriod has passed before retrieving the modelAnswer
        this.getFile(this.assignment.modelAnswer, false).then(() => {
          document.getElementById("model-answer-link").click()
        })
      }
    },
    downloadUserSubmissionFile() {
      this.loadingSubmission = true
      api({
        method: "GET",
        url: "/assignments/submission",
        params: {
          assignmentID: this.$route.params.assignmentID
        }
      }).then(response => {
        this.submission = response.data.submission
        let folders = this.submission.file.split("/")
        this.submission.fileName = folders[folders.length - 1]
        this.submission.downloadLink = URL.createObjectURL(new Blob([response.data]));
      }).finally(() => {
        this.loadingSubmission = false
      })
    },
    pushSubmission() {
      this.loading = true
      let formData = new FormData()
      formData.append("assignmentID", this.$route.params.assignmentID)
      formData.append("submissionFile", this.submission.bytes)
      let method = (this.submission.userID === 0 && this.submission.assignmentID === 0) ? "POST" : "PUT"
      api({
        method: method,
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
    },
    momentDifference: function (deadline, uploadedAt) {
      deadline = moment(deadline)
      uploadedAt = moment(uploadedAt)
      let diff = deadline.diff(uploadedAt, 'minutes');
      if (diff >= 0)
        return "Early"
      return "Late"
    }
  },
}
</script>

<style scoped>
.download-link {
  text-decoration: none !important;
}
</style>