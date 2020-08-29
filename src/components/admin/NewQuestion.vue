<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" flat dark>
      <v-spacer></v-spacer>

      <span>Marks</span>
      <v-col cols="3" md="2">
        <ValidationObserver ref="markObserver">
          <ValidationProvider v-slot="{errors}" rules="required|numeric|max:1">
            <v-text-field
              solo
              rounded
              v-model="question.marks"
              v-click-outside="validateMark"
              class="mt-10"
              :error-messages="errors"
            ></v-text-field>
          </ValidationProvider>
        </ValidationObserver>
      </v-col>
    </v-toolbar>
    <v-card-text>
      <ValidationObserver ref="observer">
        <form>
          <ValidationProvider v-slot="{errors}" rules="required">
            <v-textarea
              label="Question Text"
              type="text"
              v-model="question.text"
              prepend-icon="mdi-script-text"
              rows="2"
              :error-messages="errors"
            ></v-textarea>
          </ValidationProvider>
          <v-row align="center" justify="center">
            <v-switch v-model="question.mcq" :label="question.mcq ? 'MCQ' : 'Long Answer'"></v-switch>
          </v-row>
          <div v-if="question.mcq">
            <v-radio-group v-model="question.selected">
              <Choice
                v-for="choice in question.choices"
                :key="choice.id"
                :staticText="choice.text"
                :value="choice.value"
                :id="choice.id"
                @changeText="changeText"
                @clearChoice="clearChoice"
              ></Choice>
            </v-radio-group>
          </div>
        </form>
      </ValidationObserver>
    </v-card-text>
    <v-card-actions>
      <v-btn color="secondary" @click="addChoice">Add Choice</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="sendChoices" :loading="loading">Submit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from "@/gateways/api.js";
import Choice from "@/components/quizzes/Choice.vue";
export default {
  name: "NewQuestion",
  components: {
    Choice,
  },

  data() {
    return {
      loading: false,
      question: {
        text: "",
        marks: 1,
        mcq: true,
        choices: [],
        selected: -1,
      },
      totalCreatedChoices: 0,
      canCreateNew: true,
    };
  },

  methods: {
    validateMark() {
      this.$refs.markObserver.validate();
    },
    async addChoice() {
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        if (this.question.choices.length === 0) {
          this.sendQuestion();
        }
      }
      if (isValid) {
        if (this.canCreateNew) {
          this.question.choices.push({
            id: this.totalCreatedChoices,
            text: "",
            databaseID: 0,
          });
          this.totalCreatedChoices++;
        }
        this.updateCanCreateNew();
      }
    },
    changeText(options) {
      let id = options.id;
      this.question.choices.forEach((element) => {
        if (element.id === id) {
          element.text = options.text;
        }
      });
      this.updateCanCreateNew();
    },
    clearChoice(options) {
      let id = options.id;
      this.question.choices.forEach((element, index) => {
        if (element.id === id) {
          this.question.choices.splice(index, 1);
        }
      });
      this.updateCanCreateNew();
    },
    updateCanCreateNew() {
      this.canCreateNew = true;
      this.question.choices.forEach((element) => {
        if (element.text === "") {
          this.canCreateNew = false;
        }
      });
    },
    async sendQuestion() {
      let validQuestion = await this.$refs.observer.validate();
      if (validQuestion) {
        let formData = new FormData();
        formData.append("text", this.question.text);
        formData.append("totalMark", this.question.marks);
        formData.append("quizID", this.$route.params.quizID);

        api({
          method: "POST",
          url: "/quizzes/questions/mcq",
          data: formData,
        }).then((response) => {
          this.question.id = response.data.mcq.question.id;
        });
      }
    },
    async sendChoices() {
      let validQuestion = await this.$refs.observer.validate();
      if (validQuestion) {
        this.question.choices.forEach((choice, index) => {
          let formData = new FormData();
          formData.append("text", choice.text);
          formData.append("mcqID", this.question.id);
          api({
            method: "POST",
            url: "/quizzes/choices",
            data: formData,
          }).then((response) => {
            this.question.choices[index].databaseID = response.data.choice.id;
            this.updateQuestion();
          });
        });
      }
    },
    updateQuestion() {
      // Update the question to save the correct answer
      let formData = new FormData();
      this.question.choices.forEach((choice) => {
        if (choice.id === this.question.selected) {
          formData.append("correctAnswer", choice.databaseID);
        }
      });
      formData.append("id", this.question.id);
      formData.append("correctAnswer", this.question.selected);
      formData.append("totalMark", this.question.marks);
      formData.append("text", this.question.text);
      api({
        method: "PUT",
        url: "/quizzes/questions/mcq",
        data: formData,
      });
    },
  },
};
</script>
