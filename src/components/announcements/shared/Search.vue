<template>
  <div class="text-center">
    <v-sheet class="text-center">
      <v-text-field
        label="Title"
        prepend-icon="mdi-format-text"
        type="text"
        v-model="searchValues.title"
      ></v-text-field>

      <v-text-field
        label="Topic"
        type="text"
        v-model="searchValues.topic"
        prepend-icon="mdi-subtitles"
      ></v-text-field>

      <v-text-field
        label="Content"
        type="text"
        v-model="searchValues.content"
        prepend-icon="mdi-text"
      ></v-text-field>

      <v-btn color="primary" @click="search" class="ma-2">Search</v-btn>
      <v-btn color="secondary" @click="cancel" class="ma-2">Cancel</v-btn>
      <v-btn color="secondary" @click="retrieveAll" class="ma-2">Retrieve All</v-btn>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "Search",
  data: () => ({
    sheet: false,
    searchValues: {
      title: "",
      topic: "",
      content: "",
    },
  }),
  mounted() {
    this.cachedSearchValues = Object.assign({}, this.searchValues);
  },
  methods: {
    cancel() {
      this.searchValues = Object.assign({}, this.cachedSearchValues);
      this.$emit("closeSearchSheet");
    },
    search() {
      this.$emit("closeSearchSheet");
      this.$emit("search", {
        searchValues: this.searchValues,
      });
    },
    retrieveAll() {
      this.searchValues.title = "";
      this.searchValues.topic = "";
      this.searchValues.content = "";
      this.search();
    },
  },
};
</script>