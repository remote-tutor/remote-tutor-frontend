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
import AnnouncementsAppBar from "@/components/announcements/AppBar.vue";
import NewQuiz from '@/components/admin/NewQuiz.vue'
export default {
    name: "CreateQuiz",
    components: {
        AnnouncementsAppBar,
        NewQuiz,
    }
};
</script>