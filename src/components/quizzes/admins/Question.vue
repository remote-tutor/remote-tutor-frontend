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

            <v-row v-if="editMode">
              <v-col cols="12" sm="8">
                <ValidationProvider v-slot="{errors}" rules="required_if:question-image" vid="question-text">
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
                <ValidationProvider v-slot="{errors}" rules="image|required_if:question-text" vid="question-image">
                  <v-file-input accept="image/*" small-chips show-size
                                label="Question" v-model="questionData.question.image" @change="previewImage"
                                prepend-icon="mdi-file-question" :error-messages="errors"></v-file-input>
                </ValidationProvider>
              </v-col>
            </v-row>

            <v-card-title class="headline" v-else>
              {{ questionData.question.text }}
            </v-card-title>

            <v-img v-if="questionData.question.image !== undefined" :src="questionData.question.imageSrc"></v-img>

            <div v-if="questionData.mcq">
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
  props: ['staticID', 'staticText', 'staticTotalMark', 'staticChoices', 'staticCorrectAnswer', 'staticImage', 'staticImagePath', 'isNew'],
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
          image: [],
          imagePath: this.staticImagePath || '',
          imageSrc: '',
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
            isNew: true,
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
      formData.append("image", this.questionData.question.image)
      let method = this.new ? "POST" : "PUT";
      let response = await api({
        method: method,
        url: "/admin/quizzes/questions/mcq",
        data: formData,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      })
      this.questionData.question.ID = response.data.mcq.question.ID;
      this.questionData.question.imagePath = response.data.mcq.question.imagePath


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

        this.$emit("placeholderFilled", {
          questionData: this.questionData,
          new: this.new,
        });
        this.new = false;
        this.pushQuestion().then(() => {
          this.loading = false
          this.changeEditMode()
        })
      }

    },
    async pushChoice(choice, index) {
      let formData = new FormData();
      formData.append("id", choice.ID)
      formData.append("text", choice.text);
      formData.append("mcqID", this.questionData.question.ID);
      let method = choice.isNew ? "POST" : "PUT";
      await api({
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
      formData.append("quizID", this.$route.params.quizID);
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
    previewImage() {
      (this.questionData.question.image === undefined) ?
          this.questionData.question.imageSrc = '' :
          this.questionData.question.imageSrc = URL.createObjectURL(this.questionData.question.image)
    },
    getImage() {
      const url = process.env.VUE_APP_API_URL;
      this.questionData.question.imageSrc = url + "/image/" + this.staticImagePath
    }
  },
  created() {
    if (this.isNew) {
      this.new = true;
      this.editMode = true;
    } else {
      this.getImage()
    }
  },
};
</script>
