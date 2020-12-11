<template>
  <div class="text-center">
    <v-dialog
        @click:outside="closeDialog"
        v-model="dialog"
        persistent
    >
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Changes
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-card>
                <v-card-title>Students to Add</v-card-title>
                <v-data-table
                    :headers="headers"
                    :items="addedTo"
                    must-sort
                    sort-by="user.fullName"
                    :footer-props="{
        'items-per-page-options': [10, -1],
      }"
                >

                </v-data-table>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card>
                <v-card-title>Students to Remove</v-card-title>

                <v-data-table
                    :headers="headers"
                    :items="removedFrom"
                    must-sort
                    sort-by="user.fullName"
                    :footer-props="{
        'items-per-page-options': [10, -1],
      }"
                ></v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
              text
              :disabled="loading"
              @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              :loading="loading"
              @click="pushPayments"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import api from "@/gateways/api";
import {mapState} from "vuex";

export default {
  name: "ConfirmationTable",
  props: ['dialog', 'addedTo', 'removedFrom', 'date'],
  computed: {
    ...mapState(['userData', 'classes']),
    selectedClass() {
      return this.classes.values[this.classes.selectedClass].classHash
    },
  },
  data() {
    return {
      headers: [
        {text: "Full Name", value: "user.fullName"}
      ],
      loading: false
    }
  },
  methods: {
    closeDialog() {
      if (this.loading)
        return
      this.$emit('update:dialog', false)
    },
    pushPayments() {
      this.loading = true
      let formData = new FormData()
      formData.append("selectedClass", this.selectedClass)
      formData.append("startDate", new Date(this.date).getTime())
      formData.append("addedTo[]", this.addedTo.map(student => student.userID))
      formData.append("removedFrom[]", this.removedFrom.map(student => student.userID))
      api({
        method: "POST",
        url: "/admin/payments/week",
        data: formData
      }).then(() => {
        this.$emit('saved')
        this.loading = false
        this.closeDialog()
      }).catch(() => {
        this.loading = false
      })
    },
  }
}
</script>

<style scoped>

</style>