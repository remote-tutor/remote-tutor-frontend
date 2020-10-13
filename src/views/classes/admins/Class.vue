<template>
  <v-app>
    <AppBar page-name="Class"></AppBar>
    <v-main>
      <v-container>
        <v-card>
          <v-card-title>
            Admins For: {{ classValue.name }}
            <v-spacer></v-spacer>
            Subject: {{ classValue.organization.subject }}
            <v-spacer></v-spacer>
            Taught By Mr. {{ classValue.organization.teacherName }}
          </v-card-title>
          <v-card-text>
            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="admins"
                :loading="loading"
                show-select
                item-key="user.username"
                :footer-props="{
                  'items-per-page-options': [-1],
                  'show-current-page': true,
                }"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "Class",
  components: {AppBar},
  computed: {
    ...mapState(['classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    }
  },
  data() {
    return {
      headers: [
        {text: "Full Name", value: "user.fullName"},
        {text: "Username", value: "user.username"},
      ],
      admins: [],
      selected: [],
      loading: false,
      classValue: {
        organization: {}
      },
    }
  },
  methods: {
    getAdmins() {
      this.loading = true
      api({
        method: 'GET',
        url: '/admin/classes/admins',
      }).then(response => {
        this.admins = response.data.admins
      }).finally(() => {
        this.loading = false
      })
    },
    getClass() {
      api({
        method: 'GET',
        url: '/classes/class'
      }).then(response => {
        this.classValue = response.data.class
      })
    },
  },
  watch: {
    selectedClass(val) {
      this.$router.replace({name: 'Class', params: {classHash: val}})
      this.getClass()
      this.getAdmins()
    }
  },
  mounted() {
    this.getClass()
    this.getAdmins()
  }
}
</script>

<style scoped>

</style>