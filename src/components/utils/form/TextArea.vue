<template>
  <ValidationProvider v-slot="{errors}" :rules="rules">
    <v-textarea
        :label="label"
        :prepend-icon="preIcon"
        type="text"
        v-model="updatedValue"
        :error-messages="errors"
        @input="(val) => $emit('update:value', val)"
        :rows="rows"
    ></v-textarea>
  </ValidationProvider>
</template>

<script>
export default {
  name: "TextArea",
  props: ["value", "label", "preIcon", "rules", "rows"],
  data() {
    return {
      updatedValue: this.value || ""
    }
  },
}
</script>

<style scoped>

</style>