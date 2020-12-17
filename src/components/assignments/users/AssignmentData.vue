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
                <v-btn outlined v-if="assignment.questions.length > 0"
                       @click="getUrl(questionsLoading, assignment.questions)" :loading="questionsLoading.value">
                  Questions
                  <v-icon>mdi-cloud-download</v-icon>
                </v-btn>
                <div v-else>We couldn't find the questions file for this assignment</div>
              </v-col>
              <v-col cols="12" md="6">
                <div v-if="!showModelAnswer">
                  <span v-if="assignment.modelAnswerPeriod === 0">
                    The model answer will be available immediately after the deadline (if found)
                  </span>
                  <span v-else>
                    The model answer will be available after the deadline by {{ assignment.modelAnswerPeriod }} hour(s)
                    (if found)
                  </span>
                </div>
                <v-btn outlined v-else-if="assignment.modelAnswer.length > 0"
                       @click="getUrl(answersLoading, assignment.modelAnswer)" :loading="answersLoading.value">
                  Model Answer
                  <v-icon>mdi-cloud-download</v-icon>
                </v-btn>
                <div v-else>We couldn't find the model answer file for this assignment</div>
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
                <v-btn outlined @click="getUrl(submissionLoading, submission.file)"
                       :loading="submissionLoading.value">
                  Your Submission
                  <v-icon>mdi-cloud-download</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-file-input v-if="!submission.graded"
                    chips
                    show-size
                    label="Submission"
                    hint="If you updated the submission, the previous one will be deleted"
                    persistent-hint
                    prepend-icon="mdi-format-list-text"
                    v-model="submission.bytes"
                ></v-file-input>
                <div v-else-if="submission.feedback.length === 0">There's no feedback associated with this submission</div>
                <div v-else>Feedback: {{submission.feedback}}</div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions v-if="!submission.graded">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="pushSubmission" :loading="loading"
                   :disabled="submission.bytes === undefined">
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
import {getSignedUrl} from '@/components/assignments/shared/signedUrl';

export default {
  name: "AssignmentData",
  data() {
    return {
      loading: false,
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
      },
      questionsLoading: {value: false},
      answersLoading: {value: false},
      submissionLoading: {value: false},
    }
  },
  created() {
    api({
      method: "GET",
      url: "/assignments/assignment",
      params: {
        assignmentHash: this.$route.params.assignmentHash
      }
    }).then(response => {
      this.assignment = response.data.assignment
      this.showModelAnswer = moment(this.assignment.deadline)
          .add(this.assignment.modelAnswerPeriod, 'hours')
          .isBefore(moment()) && this.assignment.modelAnswer.length > 0
      this.getSubmission()
    })
  },
  methods: {
    getSubmission() {
      api({
        method: "GET",
        url: "/assignments/submissions/submission",
        params: {
          assignmentHash: this.assignment.hash
        }
      }).then(response => {
        this.submission = response.data.submission
      })
    },
    pushSubmission() {
      this.loading = true
      let formData = new FormData()
      formData.append("assignmentID", this.assignment.ID)
      formData.append("assignmentHash", this.assignment.hash)
      formData.append("submissionFile", this.submission.bytes)
      let method = (this.submission.userID === 0 && this.submission.assignmentID === 0) ? "POST" : "PUT"
      api({
        method: method,
        url: "/assignments/submissions",
        data: formData,
      }).then(() => {
        this.$router.push({name: 'Assignments'})
      }).finally(() => {
        this.loading = false
      })
    },
    getUrl(loading, link) {
      getSignedUrl(this, loading, link)
    },
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

</style>