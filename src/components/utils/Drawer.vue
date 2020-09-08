<template>
  <div>
    <template>
      <v-navigation-drawer
          :permanent="$vuetify.breakpoint.mdAndUp"
          :expand-on-hover="$vuetify.breakpoint.mdAndUp"
          dark
          v-model="open"
          app
          clipped
      >
        <v-list>
          <v-list-item link>
            <v-list-item-content>
              <v-list-item-title class="title">{{ userData.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list nav dense rounded>
          <v-list-item-group v-model="selected">
            <v-list-item :to="{ name: 'Announcements' }">
              <v-list-item-icon>
                <v-icon>mdi-bullhorn</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Announcements</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'Quizzes' }">
              <v-list-item-icon>
                <v-icon>mdi-head-question</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Quizzes</v-list-item-title>
            </v-list-item>
            <v-list-item link>
              <v-list-item-icon>
                <v-icon>mdi-comment-question</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Assignments</v-list-item-title>
            </v-list-item>
            <v-list-item link>
              <v-list-item-icon>
                <v-icon>mdi-account-star</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Grades</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'Students' }" v-if="userData.admin">
              <v-list-item-icon>
                <v-icon>mdi-account-group</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Students</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>

      </v-navigation-drawer>
    </template>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: "Drawer",
  props: ["staticOpen"],
  data() {
    return {
      open: this.staticOpen || false,
      selected: 1,
    }
  },
  computed: {
    ...mapState(['userData'])
  },
  methods: {
    logout() {
      this.$store.dispatch("setUserData", {
        admin: false,
        name: '',
        token: ''
      })
      this.$router.push({name: 'Login'})
    }
  },
  watch: {
    staticOpen: function (val) {
      this.open = val
    },
    open: function (val) {
      this.$emit('closedDrawer', {
        value: val
      })
    }
  }
}
</script>