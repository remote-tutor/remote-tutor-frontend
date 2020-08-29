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
import AnnouncementsAppBar from "@/components/announcements/AppBar.vue";
import NewQuestion from '@/components/admin/NewQuestion.vue'
export default {
    name: "CreateQuestion",
    components: {
        AnnouncementsAppBar,
        NewQuestion,
    }
};
</script>