<template>
  <v-col cols="12">
    <v-card elevation="5">
      <v-text-field
        v-if="editMode"
        label="Title"
        type="text"
        v-model="announcementData.title"
        prepend-icon="mdi-format-text"
      ></v-text-field>
      <v-card-title class="headline" v-else>
        {{announcementData.title}}
        <v-spacer></v-spacer>
        <div>
          <div class="text-body-1">{{announcementData.created_at}}</div>
        </div>
      </v-card-title>
      <v-text-field
        v-if="editMode"
        label="Topic"
        type="text"
        v-model="announcementData.topic"
        prepend-icon="mdi-subtitles"
      ></v-text-field>
      <v-card-subtitle v-else>{{announcementData.topic}}</v-card-subtitle>

      <v-textarea
        v-if="editMode"
        label="Content"
        type="text"
        v-model="announcementData.content"
        prepend-icon="mdi-text"
        rows="3"
      ></v-textarea>
      <v-card-text v-else class="text-left text--primary">{{announcementData.content}}</v-card-text>

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
export default {
  name: "Announcement",
  components: {
    ConfirmationDialog,
  },
  props: [
    "staticTitle",
    "staticTopic",
    "staticContent",
    "staticCreatedAt",
    "id",
    "isNew",
  ],
  computed: {
    ...mapState(['userData'])
  },
  data() {
    return {
      editMode: false,
      announcementData: {
        id: this.id,
        title: this.staticTitle || "",
        topic: this.staticTopic || "",
        content: this.staticContent || "",
        created_at: this.staticCreatedAt || "",
      },
      new: false,
      loading: false,
    };
  },
  methods: {
    changeEditMode() {
      this.editMode = !this.editMode;
    },
    cancelChanges() {
      if (this.new) {
        this.$emit("deleteNewAnnouncement");
      } else {
        this.changeEditMode();
        this.announcementData = Object.assign({}, this.cachedAnnouncementData);
      }
    },
    pushAnnouncement() {
      this.loading = true;
      let formData = new FormData();
      formData.append("id", this.announcementData.id);
      formData.append("title", this.announcementData.title);
      formData.append("topic", this.announcementData.topic);
      formData.append("content", this.announcementData.content);
      let method = this.new ? "POST" : "PUT";
      api({
        method: method,
        url: "/admin/announcements",
        data: formData,
      })
        .then((response) => {
          this.changeEditMode();
          this.announcementData.id = response.data.announcement.id;
          this.announcementData.created_at = response.data.announcement.created_at.substring(
            0,
            10
          );
          this.$emit("placeholderFilled", {
            announcementData: this.announcementData,
            new: this.new,
          });
          this.new = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    deleteAnnouncement() {
      let formData = new FormData();
      formData.append("id", this.announcementData.id);
      api({
        method: "DELETE",
        url: "/admin/announcements",
        data: formData,
      })
        .then(() => {
          this.$emit("deleteAnnouncement", {
            id: this.announcementData.id,
          });
        })
    },
  },
  created() {
    if (this.isNew) {
      this.new = true;
      this.editMode = true;
    }
  },
  mounted() {
    this.cachedAnnouncementData = Object.assign({}, this.announcementData);
  },
};
</script>