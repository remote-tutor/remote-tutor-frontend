<template>
  <v-app>
    <AnnouncementsAppBar
      :admin="true"
    ></AnnouncementsAppBar>
    <v-main>
        <v-container>
            <NewQuiz></NewQuiz>
        </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AnnouncementsAppBar from "@/components/announcements/shared/AppBar.vue";
import NewQuiz from '@/components/quizzes/admins/Quiz.vue'
export default {
    name: "CreateQuiz",
    components: {
        AnnouncementsAppBar,
        NewQuiz,
    }
};
</script>