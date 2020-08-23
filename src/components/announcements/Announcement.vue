<template>
  <v-col cols="12">
    <v-card elevation="5">
      <v-text-field
        v-if="editMode"
        label="Title"
        type="text"
        v-model="title"
        prepend-icon="mdi-format-text"
      ></v-text-field>
      <v-card-title class="headline" v-else>{{title}}</v-card-title>

      <v-text-field
        v-if="editMode"
        label="Topic"
        type="text"
        v-model="topic"
        prepend-icon="mdi-subtitles"
      ></v-text-field>
      <v-card-subtitle v-else>{{topic}}</v-card-subtitle>

      <v-textarea
        v-if="editMode"
        label="Content"
        type="text"
        v-model="content"
        prepend-icon="mdi-text"
        rows="3"
      ></v-textarea>
      <v-card-text v-else class="text-left text--primary">{{content}}</v-card-text>

      <v-card-actions v-if="admin">
        <v-btn color="primary" v-if="editMode" @click="updateAnnouncement">Save</v-btn>
        <v-btn color="primary" v-else @click="changeEditMode">Edit</v-btn>
        <v-btn color="secondary" v-if="editMode" @click="changeEditMode">Cancel</v-btn>

        <v-spacer></v-spacer>
        <v-btn color="error">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import axios from "axios";
export default {
  name: "Announcement",
  props: ["staticTitle", "staticTopic", "staticContent", "admin", "id"],
  data() {
    return {
      editMode: false,
      title: this.staticTitle,
      topic: this.staticTopic,
      content: this.staticContent,
    };
  },
  methods: {
    changeEditMode() {
      this.editMode = !this.editMode;
    },
    updateAnnouncement() {
      let formData = new FormData();
      formData.append("id", this.id);
      formData.append("title", this.title);
      formData.append("topic", this.topic);
      formData.append("content", this.content);
      this.changeEditMode();
      axios({
        method: "PUT",
        url: "//localhost:3000/announcement",
        data: formData,
      })
        .then((response) => {
          this.$store.dispatch("viewScnackbar", {
            text: response.data.message,
            color: "success",
          });
        })
        .catch((error) => {
          this.$store.dispatch("viewScnackbar", {
            text: error.response.data.message,
            color: "error",
          });
        });
    },
  },
};
</script>