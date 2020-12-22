<template>
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

          <v-row v-if="editMode">
            <v-col cols="12" sm="8">
              <ValidationProvider v-slot="{errors}" vid="question-text">
                <v-textarea
                    ref="question-text"
                    label="Question Text"
                    type="text"
                    v-model="questionData.question.text"
                    prepend-icon="mdi-script-text"
                    rows="2"
                    :error-messages="errors"
                ></v-textarea>
              </ValidationProvider>
            </v-col>
            <v-col cols="12" sm="4">
              <ValidationProvider v-slot="{errors}" rules="image" vid="question-image">
                <v-file-input accept="image/*" small-chips show-size
                              label="Question" v-model="questionData.question.image" @change="previewImage"
                              prepend-icon="mdi-file-question" :error-messages="errors"></v-file-input>
              </ValidationProvider>
            </v-col>
          </v-row>

          <v-card-title class="headline" v-else>
            {{ questionData.question.text }}
          </v-card-title>

          <v-img v-if="questionData.question.imageSrc.length > 0"
                 :src="questionData.question.imageSrc"></v-img>

          <v-radio-group v-model="questionData.correctAnswer" :readonly="!editMode" :disabled="!editMode" mandatory>
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
        </form>
      </ValidationObserver>
    </v-card-text>
    <v-card-actions v-if="userData.admin">
      <v-btn color="primary" v-if="!editMode" @click="changeEditMode">Edit</v-btn>
      <v-btn color="primary" v-if="editMode" @click="addChoice">Add Choice</v-btn>
      <v-btn color="success" v-if="editMode" @click="sendChoices" :loading="loading">Save</v-btn>

      <v-spacer></v-spacer>
      <v-btn color="secondary" text v-if="editMode" class="mr-2" @click="cancelChanges">Cancel</v-btn>
      <ConfirmationDialog
          v-if="!this.newQuestion"
          buttonText="Delete"
          mainText="Delete This Item?"
          message="You won't be able to restore the deleted question"
          @confirm="deleteQuestion"
      ></ConfirmationDialog>
    </v-card-actions>
  </v-card>
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
  props: ['question', 'isNew', 'quiz', 'editMode'],
  computed: {
    ...mapState(['userData']),
  },
  data() {
    return {
      loading: false,
      choicesToBeDeleted: [],
      totalCreatedChoices: 0,
      canCreateNew: true,
      newQuestion: this.isNew,
      questionData: {
        question: {
          ID: this.question.question.ID || 0,
          text: this.question.question.text || "",
          totalMark: this.question.question.totalMark || 1,
          image: [],
          imagePath: this.question.question.imagePath || '',
          imageSrc: this.question.question.imageSrc || '',
        },
        correctAnswer: this.question.correctAnswer || -1,
        choices: this.question.choices || []
      },
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
        if (this.canCreateNew) {
          this.questionData.choices.push({
            ID: this.totalCreatedChoices++,
            text: "",
            isNew: true,
          });
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
          if (!element.isNew) {
            this.choicesToBeDeleted.push(id)
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
    pushQuestion() {
      let formData = new FormData();
      formData.append("id", this.questionData.question.ID);
      formData.append("text", this.questionData.question.text);
      formData.append("totalMark", this.questionData.question.totalMark);
      formData.append("quizID", this.quiz.ID);
      formData.append("correctAnswer", this.questionData.correctAnswer);
      formData.append("image", this.questionData.question.image)
      let method = this.newQuestion ? "POST" : "PUT";
      return api({
        method: method,
        url: "/admin/quizzes/questions/mcq",
        data: formData,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      })
    },
    sendChoices() {
      this.loading = true
      this.pushQuestion().then(response => {
        this.questionData.question.ID = response.data.mcq.question.ID;
        this.questionData.question.imagePath = response.data.mcq.question.imagePath
        if (this.newQuestion)
          this.questionData.question.image = []
        let deleteChoices = []
        this.choicesToBeDeleted.forEach(id => {
          deleteChoices.push(this.deleteChoice(id))
        })
        return Promise.all(deleteChoices)
      }).then(() => {
        let updateChoices = []
        this.questionData.choices.forEach((choice, index) => {
          updateChoices.push(this.pushChoice(choice, index))
        })
        return Promise.all(updateChoices)
      }).then(() => {
        this.$emit("placeholderFilled", {
          questionData: this.questionData,
          new: this.newQuestion,
        });
        this.newQuestion = false;
        return this.pushQuestion()
      }).then(() => {
        this.loading = false
        this.$emit('updateQuestion', this.questionData)
        this.changeEditMode()
      })
    },
    deleteChoice(choiceID) {
      let formData = new FormData();
      formData.append("id", choiceID)
      return api({
        method: "DELETE",
        url: "/admin/quizzes/choices",
        data: formData,
      })
    },
    pushChoice(choice, index) {
      let formData = new FormData();
      formData.append("id", choice.ID)
      formData.append("text", choice.text);
      formData.append("mcqID", this.questionData.question.ID);
      let method = choice.isNew ? "POST" : "PUT";
      return api({
        method: method,
        url: "/admin/quizzes/choices",
        data: formData,
      }).then((response) => {
        let oldID = choice.ID
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
      formData.append("quizID", this.quiz.ID);
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
      this.$emit('update:editMode', !this.editMode)
    },
    previewImage() {
      (this.questionData.question.image === undefined) ?
          this.questionData.question.imageSrc = '' :
          this.questionData.question.imageSrc = URL.createObjectURL(this.questionData.question.image)
    },
  },
  watch: {
    question() {
      this.questionData = {
        question: {
          ID: this.question.question.ID || 0,
          text: this.question.question.text || "",
          totalMark: this.question.question.totalMark || 1,
          image: [],
          imagePath: this.question.question.imagePath || '',
          imageSrc: this.question.question.imageSrc || '',
        },
        correctAnswer: this.question.correctAnswer || -1,
        choices: this.question.choices || [],
      }
      this.choicesToBeDeleted = []
      this.totalCreatedChoices = 0
      this.canCreateNew = true
    },
    isNew(val) {
      this.newQuestion = val
    }
  },
};
</script>
