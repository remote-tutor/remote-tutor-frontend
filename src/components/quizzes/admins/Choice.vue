<template>
  <div>
    <ValidationObserver ref="observer">
      <ValidationProvider v-slot="{errors}" rules="required">
        <v-row>
          <v-col>
            <v-text-field
              v-model="text"
              filled
              label="Answer"
              :error-messages="errors"
              @input="changeText"
              @chnge="changed"
              append-icon="mdi-close"
              @click:append="clearChoice"
            ></v-text-field>
          </v-col>
        </v-row>
      </ValidationProvider>
    </ValidationObserver>
    <v-radio :label="text" :value="value"></v-radio>
  </div>
</template>

<script>
// import api from "@/gateways/api.js";
export default {
  name: "Choice",
  props: ["staticText", "value", "id"],

  data() {
    return {
      text: this.staticText || "",
    };
  },

  methods: {
    changeText() {
      this.$emit("changeText", {
        id: this.id,
        text: this.text,
      });
    },
    clearChoice() {
        this.$emit("clearChoice", {
            id: this.id
        })
    },
    changed() {
        console.log("changed")
    },
  },
};
</script>
