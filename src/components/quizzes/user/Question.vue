<template>
  <v-card class="elevation-12" v-if="question">
    <v-toolbar color="primary" flat dark>
      <v-spacer></v-spacer>

      <span>Marks</span>
      <v-col cols="3" md="2">
        <template>
          <v-btn icon large :readonly="true">
            {{ question.question.totalMark }}
          </v-btn>
        </template>

      </v-col>
    </v-toolbar>
    <v-card-text>
      <v-card-title class="headline">
        {{ question.question.text }}
      </v-card-title>

      <div v-if="mcq">
        <v-radio-group v-model="updatedChoice"
                       :readonly="review"
                       :disabled="review"
                       @change="(val) => $emit('updateChoice', {choice: val || -1})"
                       column>
          <v-col>
            <v-radio v-for="choice in question.choices" class="pa-2"
                     :key="choice.id"
                     :value="choice.id"
                     :label="choice.text">
            </v-radio>
          </v-col>
        </v-radio-group>
      </div>

    </v-card-text>
    <v-card-actions>

    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "Question",
  props: ['question', 'mcq', 'review', 'selectedChoice'],
  data() {
    return {
      updatedChoice: this.selectedChoice || -1
    }
  },
  watch: {
    selectedChoice: function(val) {
      this.updatedChoice = val || -1
    }
  }
}
</script>

<style scoped>

</style>