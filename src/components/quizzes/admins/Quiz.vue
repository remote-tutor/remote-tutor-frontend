<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-card-text>
      <ValidationObserver ref="observer">
        <form>
          <ValidationProvider v-slot="{errors}" rules="required">
            <v-text-field
                label="Title"
                prepend-icon="mdi-format-title"
                type="text"
                v-model="quiz.title"
                :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
          <v-icon>mdi-calendar</v-icon>
          <span>Start Date</span>
          <Datetime
              type="datetime"
              use12-hour
              input-class="rounded-0 grey lighten-3"
              v-model="quiz.startTime"
              :min-datetime="new Date().toISOString()"
          ></Datetime>
          <ValidationProvider rules="required" v-slot="{errors}">
            <input v-model="quiz.startTime" v-show="false"/>
            <div class="red--text">{{ errors[0] }}</div>
          </ValidationProvider>

          <v-icon>mdi-calendar</v-icon>
          <span>End Date</span>
          <Datetime
              type="datetime"
              use12-hour
              v-model="quiz.endTime"
              :min-datetime="quiz.startTime || new Date().toISOString()"
              input-class="rounded-0 grey lighten-3"
          ></Datetime>
          <ValidationProvider rules="required" v-slot="{errors}">
            <input v-model="quiz.endTime" v-show="false"/>
            <div class="red--text">{{ errors[0] }}</div>
          </ValidationProvider>

          <v-row v-if="maxStudentDuration !== 0">
            <v-col cols="12">
              <span class="subheading">Student Duration</span>
            </v-col>

            <v-slider v-model="quiz.studentTime" :max="maxStudentDuration" :min="0" class="align-center">
              <template v-slot:append>
                <v-text-field
                    v-model="hours" class="mt-0 pt-0 mr-1" label="Hours" type="number" style="width: 45px"
                ></v-text-field>
                <v-text-field
                    v-model="minutes" class="mt-0 pt-0" label="Minutes" type="number" style="width: 45px"
                ></v-text-field>
              </template>
            </v-slider>
          </v-row>

        </form>
      </ValidationObserver>
    </v-card-text>
    <v-card-actions v-if="userData.admin">
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
      <v-btn color="primary" @click="saveQuiz" :loading="loading">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from "@/gateways/api.js";
import moment from "moment";
import {mapState} from "vuex";

export default {
  name: "Quiz",
  props: ['editedIndex', 'staticQuiz'],
  data() {
    return {
      loading: false,
      quiz: this.staticQuiz || {
        title: "",
        startTime: "",
        endTime: "",
        studentTime: 30,
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Quiz' : 'Edit Quiz'
    },
    method() {
      return this.editedIndex === -1 ? 'POST' : 'PUT'
    },
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    },
    hours: {
      get() {
        return Math.floor(this.quiz.studentTime / 60)
      }, set(val) {
        if (val === "")
          this.quiz.studentTime = this.minutes
        else {
          this.quiz.studentTime = Math.min(this.maxStudentDurationInHours, parseInt(val)) * 60 + this.minutes
        }
      }
    },
    minutes: {
      get() {
        return this.quiz.studentTime % 60
      },
      set(val) {
        if (val === "")
          this.quiz.studentTime = this.hours * 60
        else
          this.quiz.studentTime = this.hours * 60 + Math.min(59, parseInt(val))
      }
    },
    maxStudentDuration() {
      if (this.quiz.startTime === "" || this.quiz.endTime === "")
        return 0
      let start = moment(new Date(this.quiz.startTime))
      let end = moment(new Date(this.quiz.endTime))
      return end.diff(start, "minutes")
    },
    maxStudentDurationInHours() {
      return Math.floor(this.maxStudentDuration / 60)
    },
    ...mapState(['userData', 'classes'])
  },

  methods: {
    async saveQuiz() {
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        this.loading = true;
        let formData = new FormData();
        formData.append("id", this.quiz.ID)
        formData.append("title", this.quiz.title);
        formData.append("selectedClass", this.selectedClass);
        formData.append("startTime", Date.parse(this.quiz.startTime));
        formData.append("endTime", Date.parse(this.quiz.endTime));
        formData.append("studentTime", this.quiz.studentTime)
        api({
          method: this.method,
          url: "/admin/quizzes",
          data: formData,
        })
            .then((response) => {
              this.$emit("save", {
                quiz: response.data.quiz
              })
            })
            .finally(() => {
              this.loading = false;
            });
      }
    },
    close() {
      this.$emit("closeDialog")
    }
  },
  watch: {
    staticQuiz: function (val) {
      this.quiz = val
    }
  }
};
</script>
