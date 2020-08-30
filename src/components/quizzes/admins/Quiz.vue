<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="elevation-12">
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
              <ValidationProvider v-slot="{errors}" rules="excluded:0">
                <v-select
                  :items="years"
                  item-text="text"
                  item-value="value"
                  label="Year"
                  :error-messages="errors"
                  v-model="quiz.year"
                  prepend-icon="mdi-school"
                ></v-select>
              </ValidationProvider>
              <v-icon>mdi-calendar</v-icon>
              <span>Start Date</span>
              <Datetime
                type="datetime"
                use12-hour
                input-class="rounded-0 grey lighten-3"
                v-model="quiz.startDate"
                :min-datetime="new Date().toISOString()"
              ></Datetime>
              <ValidationProvider rules="required" v-slot="{errors}">
                <input v-model="quiz.startDate" v-show="false" />
                <div class="red--text">{{errors[0]}}</div>
              </ValidationProvider>

              <v-icon>mdi-calendar</v-icon>
              <span>End Date</span>
              <Datetime
                type="datetime"
                use12-hour
                v-model="quiz.endDate"
                :min-datetime="quiz.startDate || new Date().toISOString()"
                input-class="rounded-0 grey lighten-3"
              ></Datetime>
              <ValidationProvider rules="required" v-slot="{errors}">
                <input v-model="quiz.endDate" v-show="false" />
                <div class="red--text">{{errors[0]}}</div>
              </ValidationProvider>
            </form>
          </ValidationObserver>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveQuiz" :loading="loading">Add Questions</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import api from "@/gateways/api.js";
export default {
  name: "NewQuiz",

  data() {
    return {
      loading: false,
      quiz: {
        title: "",
        year: 0,
        startDate: "",
        endDate: "",
      },
      years: [
        { text: "First Year", value: 1 },
        { text: "Second Year", value: 2 },
        { text: "Third Year", value: 3 },
      ],
    };
  },

  methods: {
    async saveQuiz() {
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        this.loading = true;
        let formData = new FormData();
        formData.append("title", this.quiz.title);
        formData.append("year", this.quiz.year);
        formData.append("startTime", Date.parse(this.quiz.startDate));
        formData.append("endTime", Date.parse(this.quiz.endDate));
        api({
          method: "POST",
          url: "/quizzes",
          data: formData,
        })
          .then((response) => {
            this.$store.dispatch("viewSnackbar", {
              text: response.data.message,
              color: "success",
            });
            this.$router.push({
              name: "QuizQuestions",
              params: { quizID: response.data.quiz.id },
            });
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
};
</script>
