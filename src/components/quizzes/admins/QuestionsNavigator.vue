<template>
  <v-card outlined>
    <v-list-item>
      <v-list-item-content>
        <v-col>
          <p>MCQs</p>
          <v-btn-toggle
              @change="(val) => $emit('update:selectedQuestion', val)"
              tile
              color="deep-purple accent-3"
              group>
            <v-row dense>
              <v-col v-for="(question, index) in questions" :key="index" cols="3">
                <v-btn class="rounded-circle"
                       :value="index"
                       :disabled="selectedQuestion === index || editMode">
                  {{ index + 1 }}
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn class="rounded-circle" color="primary"
                       :value="questions.length"
                       :disabled="editMode"
                       @click="() => $emit('createPlaceholder')">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-btn-toggle>
          <span v-if="editMode">Save the current question to navigate</span>

        </v-col>
      </v-list-item-content>

    </v-list-item>
  </v-card>
</template>

<script>
export default {
  name: "QuestionsNavigator",
  props: ['questions', 'selectedQuestion', 'editMode'],
}
</script>

<style scoped>

</style>