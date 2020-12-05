<template>
  <div class="text-center">
    <v-dialog
        @click:outside="() => $emit('update:dialog', false)"
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
              @click="() => $emit('update:dialog', false)"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="() => $emit('update:dialog', false)"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: "ConfirmationTable",
  props: ['dialog', 'addedTo', 'removedFrom'],
  data() {
    return {
      headers: [
        {text: "Full Name", value: "user.fullName"}
      ]
    }
  }
}
</script>

<style scoped>

</style>