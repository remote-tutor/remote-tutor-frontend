<template>
  <v-col cols="12">
    <v-card class="elevation-12">
      <v-toolbar color="primary" flat dark>
        <v-spacer></v-spacer>

        <span>Marks</span>
        <v-col cols="3" md="2">
          <ValidationObserver ref="markObserver">
            <ValidationProvider v-slot="{errors}" rules="required|numeric|max:1">
              <v-text-field v-if="editMode"
                            solo
                            rounded
                            v-model="questionData.question.totalMark"
                            v-click-outside="validateMark"
                            class="mt-10"
                            :error-messages="errors"
              ></v-text-field>
              <template v-else>
                <v-btn icon large :readonly="true">
                  {{ questionData.question.totalMark }}
                </v-btn>
              </template>
            </ValidationProvider>
          </ValidationObserver>
        </v-col>
      </v-toolbar>
      <v-card-text>
        <ValidationObserver ref="observer">
          <form>
            <ValidationProvider v-slot="{errors}" rules="required">
              <v-textarea v-if="editMode"
                          label="Question Text"
                          type="text"
                          v-model="questionData.question.text"
                          prepend-icon="mdi-script-text"
                          rows="2"
                          :error-messages="errors"
              ></v-textarea>
              <v-card-title class="headline" v-else>
                {{ questionData.question.text }}
              </v-card-title>
            </ValidationProvider>
            <v-row align="center" justify="center">
              <v-switch :readonly="!editMode" :disabled="!editMode" v-model="questionData.mcq"
                        :label="questionData.mcq ? 'MCQ' : 'Long Answer'"></v-switch>
            </v-row>
            <div v-if="questionData.mcq">
              <v-radio-group v-model="questionData.correctAnswer" :readonly="!editMode" :disabled="!editMode">
                <Choice
                    v-for="choice in questionData.choices"
                    :key="choice.ID"
                    :staticText="choice.text"
                    :value="choice.ID"
                    :id="choice.ID"
                    :editMode="editMode"
                    @changeText="changeText"
                    @clearChoice="clearChoice"
                ></Choice>
              </v-radio-group>
            </div>
          </form>
        </ValidationObserver>
      </v-card-text>
      <v-card-actions v-if="userData.admin">
        <v-btn color="primary" v-if="!editMode" @click="changeEditMode">Edit</v-btn>
        <v-btn color="primary" v-if="editMode" @click="addChoice">Add Choice</v-btn>
        <v-btn color="success" v-if="editMode" @click="sendChoices" :loading="loading">Save</v-btn>

        <v-spacer></v-spacer>
<!--        <v-btn color="secondary" v-if="editMode" class="mr-2">Cancel</v-btn>-->
        <ConfirmationDialog
            v-if="!this.new"
            buttonText="Delete"
            mainText="Delete This Item?"
            message="You won't be able to restore the deleted question"
            @confirm="deleteQuestion"
        ></ConfirmationDialog>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import api from "@/gateways/api.js";
import Choice from "@/components/quizzes/admins/Choice.vue";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog.vue";
import {mapState} from "vuex";

export default {
  name: "Question",
  components: {
    Choice,
    ConfirmationDialog,
  },
  props: ['staticID', 'staticText', 'staticTotalMark', 'staticChoices', 'staticCorrectAnswer', 'isNew'],
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      editMode: false,
      loading: false,
      questionData: {
        question: {
          ID: this.staticID || 0,
          text: this.staticText || "",
          totalMark: this.staticTotalMark || 1,
        },
        mcq: true,
        choices: this.staticChoices || [],
        correctAnswer: this.staticCorrectAnswer || -1,
      },
      totalCreatedChoices: 0,
      canCreateNew: true,
      new: false
    };
  },

  methods: {
    validateMark() {
      if (this.$refs.markObserver !== undefined) {
        this.$refs.markObserver.validate();
      }
    },
    async addChoice() {
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        if (this.questionData.choices.length === 0) {
          await this.pushQuestion();
        }
        if (this.canCreateNew) {
          this.questionData.choices.push({
            ID: this.totalCreatedChoices,
            text: "",
          });
          this.totalCreatedChoices++;
        }
        this.updateCanCreateNew();
      }
    },
    changeText(options) {
      let id = options.id;
      this.questionData.choices.forEach((element) => {
        if (element.ID === id) {
          element.text = options.text;
        }
      });
      this.updateCanCreateNew();
    },
    clearChoice(options) {
      let id = options.id;
      this.questionData.choices.forEach((element, index) => {
        if (element.ID === id) {
          if (this.questionData.correctAnswer === element.ID) {
            this.questionData.correctAnswer = -1
          }
          this.questionData.choices.splice(index, 1);
        }
      });
      this.updateCanCreateNew();
    },
    updateCanCreateNew() {
      this.canCreateNew = true;
      this.questionData.choices.forEach((element) => {
        if (element.text === "") {
          this.canCreateNew = false;
        }
      });
    },
    async pushQuestion() {
      let formData = new FormData();
      formData.append("id", this.questionData.question.ID);
      formData.append("text", this.questionData.question.text);
      formData.append("totalMark", this.questionData.question.totalMark);
      formData.append("quizID", this.$route.params.quizID);
      formData.append("correctAnswer", this.questionData.correctAnswer);
      let method = this.new ? "POST" : "PUT";
      api({
        method: method,
        url: "/admin/quizzes/questions/mcq",
        data: formData,
      }).then((response) => {
        this.questionData.question.ID = response.data.mcq.question.ID;
      })

    },
    async sendChoices() {
      let validQuestion = await this.$refs.observer.validate();
      let choicesLength = this.questionData.choices.length
      if (choicesLength === 0) {
        this.$store.dispatch("viewSnackbar", {
          text: "Please add choices before submitting",
          color: "error",
        });
      } else if (this.questionData.correctAnswer === -1) {
        this.$store.dispatch("viewSnackbar", {
          text: "You must select an answer",
          color: "error",
        });
      }
      validQuestion = validQuestion && (choicesLength > 0) && (this.questionData.correctAnswer !== -1);
      if (validQuestion) {
        this.loading = true
        await Promise.all(
            this.questionData.choices.map(async (choice, index) => {
              await this.pushChoice(choice, index)
            }));

        this.changeEditMode()

        this.$emit("placeholderFilled", {
          questionData: this.questionData,
          new: this.new,
        });
        this.new = false;
        await this.pushQuestion();
        this.loading = false
      }

    },
    async pushChoice(choice, index) {
      let formData = new FormData();
      formData.append("id", choice.ID)
      formData.append("text", choice.text);
      formData.append("mcqID", this.questionData.question.ID);
      let method = this.new ? "POST" : "PUT";
      await api({
        method: method,
        url: "/admin/quizzes/choices",
        data: formData,
      }).then((response) => {
        let oldID = choice.ID
        console.log(this.questionData.choices)
        this.questionData.choices[index].ID = response.data.choice.ID;
        if (oldID === this.questionData.correctAnswer) {
          this.questionData.correctAnswer = this.questionData.choices[index].ID
        }
      }).catch(error => {
        console.log(error)
      });
    },
    deleteQuestion() {
      let formData = new FormData()
      formData.append("id", this.questionData.question.ID)
      api({
        method: "DELETE",
        url: "/admin/quizzes/questions/mcq",
        data: formData,
      }).then(() => {
        this.$emit("deleteQuestion", {
          id: this.questionData.question.ID,
        });
      })
    },
    changeEditMode() {
      this.editMode = !this.editMode
    },
  },
  created() {
    if (this.isNew) {
      this.new = true;
      this.editMode = true;
    }
  },
};
</script>
