<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on, attrs }" v-if="datatable">
      <v-icon small v-bind="attrs" v-on="on">mdi-delete</v-icon>
    </template>

    <template v-slot:activator="{ on, attrs }" v-else-if="videoPart">
      <v-icon v-bind="attrs" v-on="on">mdi-delete-forever</v-icon>
    </template>

    <template v-slot:activator="{ on, attrs }" v-else-if="video">
      <v-btn v-bind="attrs" v-on="on" outlined color="red">Delete</v-btn>
    </template>

    <template v-slot:activator="{ on, attrs }" v-else>
      <v-btn :color="btnColor || 'error'" dark v-bind="attrs" v-on="on">{{ buttonText }}</v-btn>
    </template>

    <v-card>
      <v-card-title class="headline grey lighten-2">Confirmation</v-card-title>

      <v-card-text>{{ mainText }}</v-card-text>
      <slot name="main-content"></slot>
      <v-card-subtitle>{{ message }}</v-card-subtitle>

      <v-card-text v-if="video">
        <strong>You must verify the item name (<i>{{ deletedItemName }}</i>) - without the parentheses - before deleting</strong>
        <v-text-field label="Deleted Item Name" v-model="typedValue"></v-text-field>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="green darken-1" text @click="hideDialog">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="confirm" v-if="video || videoPart"
               :disabled="deletedItemName !== typedValue">Confirm</v-btn>
        <v-btn color="error" text @click="confirm" v-else>Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmationDialog",
  props: {
    buttonText: String,
    mainText: String,
    message: String,
    btnColor: String,
    datatable: Boolean,
    video: Boolean,
    videoPart: Boolean,
    deletedItemName: String,
  },
  data() {
    return {
      dialog: false,
      typedValue: '',
    };
  },
  methods: {
    hideDialog() {
      this.dialog = false
    },
    confirm() {
      this.hideDialog()
      this.$emit("confirm", {
        typedValue: this.typedValue
      })
    }
  }
};
</script>