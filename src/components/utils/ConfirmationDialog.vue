<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="error" dark v-bind="attrs" v-on="on">{{buttonText}}</v-btn>
    </template>

    <v-card>
      <v-card-title class="headline grey lighten-2">Confirmation</v-card-title>

      <v-card-text>{{mainText}}</v-card-text>
      <v-card-subtitle>{{message}}</v-card-subtitle>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="green darken-1" text @click="hideDialog">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmationDialog",
  props: ["buttonText", "mainText", "message"],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
      hideDialog() {
          this.dialog = false
      },
      confirm() {
          this.hideDialog()
          this.$emit("confirm")
      }
  }
};
</script>