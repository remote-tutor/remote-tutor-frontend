<template>
  <v-app>
    <AnnouncementsAppBar
      :admin="true"
    ></AnnouncementsAppBar>
    <v-main>
        <v-container>
            <NewQuestion></NewQuestion>
        </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AnnouncementsAppBar from "@/components/announcements/shared/AppBar.vue";
import NewQuestion from '@/components/quizzes/admins/Question.vue'
export default {
    name: "CreateQuestion",
    components: {
        AnnouncementsAppBar,
        NewQuestion,
    }
};
</script>