<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="500">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="() => $emit('update:dialog', false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Payments</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="() => $emit('update:dialog', false)">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title>
          {{ studentName }}

          <v-spacer></v-spacer>
          <v-col cols="6" sm="3">
            <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="scale-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    v-model="date"
                    label="Month"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="date"
                  type="month"
                  no-title
                  scrollable>
                <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="primary" @click="saveMonth">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>

        </v-card-title>

        <v-data-table
            :headers="headers"
            :items="weeks"
            disable-sort
            class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-simple-checkbox v-model="item.status"></v-simple-checkbox>
          </template>

        </v-data-table>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "Payments",
  props: ['dialog', 'studentName'],
  data() {
    return {
      headers: [
        {text: 'From', value: 'from',},
        {text: 'To', value: 'to'},
        {text: 'Status', value: 'status',},
      ],
      weeks: [],
      date: new Date().toISOString().substr(0, 7),
      fullDate: new Date(),
      menu: false,
    }
  },
  mounted() {
    this.fullDate = new Date(this.date)
    this.initializeWeeks()
  },
  methods: {
    saveMonth() {
      this.$refs.menu.save(this.date)
      this.fullDate = new Date(this.date)

      this.initializeWeeks()
    },
    getFirstFriday() {
      let firstFriday = this.fullDate
      firstFriday.setDate(this.fullDate.getDate() + (5 + 7 - this.fullDate.getDay()) % 7)
      return firstFriday
    },
    initializeWeeks() {
      let friday = this.getFirstFriday()
      let selectedMonth = friday.getMonth()
      this.weeks = []
      while(friday.getMonth() === selectedMonth) {
        let startOfWeek = friday.toISOString().substr(0, 10)
        friday.setDate(friday.getDate() + 7)
        let endOfWeek = friday.toISOString().substr(0, 10)
        this.weeks.push({
          from: startOfWeek,
          to: endOfWeek,
          status: false
        })
      }
    }
  }
}
</script>

<style scoped>

</style>