<template>
  <v-col cols="12">
    <v-card elevation="5">
      <TextField v-if="editMode"
                 :value.sync="updatedAnnouncement.title"
                 label="Title"
                 pre-icon="mdi-format-text">
      </TextField>
      <v-card-title class="headline" v-else>
        {{ updatedAnnouncement.title }}

        <v-spacer></v-spacer>
        <div>
          <div class="text-body-1" v-if="!updatedAnnouncement.isNew">
              {{ (updatedAnnouncement.created_at).substring(0, 10) }}
          </div>
        </div>
      </v-card-title>

      <TextField v-if="editMode"
                 :value.sync="updatedAnnouncement.topic"
                 label="Topic"
                 pre-icon="mdi-subtitles">
      </TextField>
      <v-card-subtitle v-else>{{ updatedAnnouncement.topic }}</v-card-subtitle>

      <TextArea v-if="editMode"
                :value.sync="updatedAnnouncement.content"
                label="Content"
                pre-icon="mdi-text"
                :rows="3">
      </TextArea>
      <v-card-text v-else class="text-left text--primary">{{ updatedAnnouncement.content }}</v-card-text>

      <v-card-actions v-if="userData.admin">
        <v-btn color="primary" v-if="editMode" @click="pushAnnouncement" :loading="loading">Save</v-btn>
        <v-btn color="primary" v-else @click="changeEditMode">Edit</v-btn>
        <v-btn color="secondary" v-if="editMode" @click="cancelChanges">Cancel</v-btn>

        <v-spacer></v-spacer>
        <ConfirmationDialog
            v-if="!this.new"
            buttonText="Delete"
            mainText="Delete This Item?"
            message="You won't be able to restore the deleted announcement"
            @confirm="deleteAnnouncement"
        ></ConfirmationDialog>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import api from "@/gateways/api.js";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog.vue";
import {mapState} from "vuex";
import TextField from "@/components/utils/form/TextField";
import TextArea from "@/components/utils/form/TextArea";

export default {
  name: "Announcement",
  components: {
    TextArea,
    TextField,
    ConfirmationDialog,
  },
  props: [
    "announcement", "placeholderExists"
  ],
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      editMode: false,
      updatedAnnouncement: this.announcement || {},
      new: false,
      loading: false,
    };
  },
  methods: {
    changeEditMode() {
      this.editMode = !this.editMode;
    },
    cancelChanges() {
      if (this.updatedAnnouncement.isNew) {
        this.$emit("deleteAnnouncement", this.updatedAnnouncement);
      } else {
        this.changeEditMode();
        this.updatedAnnouncement = Object.assign({}, this.cachedAnnouncement);
      }
    },
    pushAnnouncement() {
      this.loading = true;
      let formData = new FormData();
      formData.append("id", this.updatedAnnouncement.id);
      formData.append("title", this.updatedAnnouncement.title);
      formData.append("topic", this.updatedAnnouncement.topic);
      formData.append("content", this.updatedAnnouncement.content);
      let method = this.new ? "POST" : "PUT";
      api({
        method: method,
        url: "/admin/announcements",
        data: formData,
      })
          .then((response) => {
            this.changeEditMode()
            this.updatedAnnouncement = response.data.announcement
            this.$emit('updateAnnouncements', {
              old: this.announcement,
              updated: this.updatedAnnouncement,
              delete: false
            })

            if (this.new) {
              this.new = false
              this.$emit('update:placeholderExists', false)
            }

          })
          .finally(() => {
            this.loading = false
          });
    },
    deleteAnnouncement() {
      let formData = new FormData();
      formData.append("id", this.updatedAnnouncement.id);
      api({
        method: "DELETE",
        url: "/admin/announcements",
        data: formData,
      })
          .then(() => {
            this.$emit("deleteAnnouncement", this.updatedAnnouncement);
          })
    },
  },
  created() {
    if (this.updatedAnnouncement.isNew) {
      this.new = true;
      this.editMode = true;
    }
  },
  mounted() {
    this.cachedAnnouncement = Object.assign({}, this.announcement);
  },
};
</script>