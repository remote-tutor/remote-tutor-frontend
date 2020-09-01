<template>
  <div>
    <ValidationObserver ref="observer">
      <ValidationProvider v-slot="{errors}" rules="required">
        <v-row>
          <v-col>
            <v-text-field v-if="editMode"
              v-model="updatedText"
              filled
              label="Answer"
              :error-messages="errors"
              @input="(val) => $emit('update:text', val)"
              append-icon="mdi-close"
              @click:append="clearChoice"
            ></v-text-field>
          </v-col>
        </v-row>
      </ValidationProvider>
    </ValidationObserver>
    <v-radio :label="updatedText" :value="value"></v-radio>
  </div>
</template>

<script>
// import api from "@/gateways/api.js";
export default {
  name: "Choice",
  props: ["value", "id", "editMode", "text"],

  data() {
    return {
      updatedText: this.text || "",
    };
  },

  methods: {
    clearChoice() {
        this.$emit("clearChoice", {
            id: this.id
        })
    },
  },
};
</script>
