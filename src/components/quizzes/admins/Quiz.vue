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
