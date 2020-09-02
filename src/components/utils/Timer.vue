<template>
  <vue-countdown-timer
      @start_callback="startCallBack('event started')"
      @end_callback="endCallBack"
      :start-time="new Date()"
      :end-time="endTime"
      :interval="1000"
      :start-label="'Until start:'"
      end-label="Remaining"
      label-position="begin"
      end-text="Time's Up"
      :day-txt="'days'"
      :hour-txt="'hours'"
      :minutes-txt="'minutes'"
      :seconds-txt="'seconds'">
    <template slot="start-label" slot-scope="scope">
      <span style="color: red"
            v-if="scope.props.startLabel !== '' && scope.props.tips && scope.props.labelPosition === 'begin'">{{ scope.props.startLabel }}:</span>
      <span style="color: blue"
            v-if="scope.props.endLabel !== '' && !scope.props.tips && scope.props.labelPosition === 'begin'">{{ scope.props.endLabel }}:</span>
    </template>

    <template slot="countdown" slot-scope="scope">
      <span>{{ scope.props.days }}:</span>
      <span>{{ scope.props.hours }}:</span>
      <span>{{ scope.props.minutes }}:</span>
      <span>{{ scope.props.seconds }}</span>
    </template>

    <template slot="end-label" slot-scope="scope">
      <span style="color: red"
            v-if="scope.props.startLabel !== '' && scope.props.tips && scope.props.labelPosition === 'end'">{{ scope.props.startLabel }}:</span>
      <span style="color: blue"
            v-if="scope.props.endLabel !== '' && !scope.props.tips && scope.props.labelPosition === 'end'">{{ scope.props.endLabel }}:</span>
    </template>

    <template slot="end-text" slot-scope="scope">
      <span style="color: green">{{ scope.props.endText }}</span>
    </template>
  </vue-countdown-timer>
</template>

<script>
export default {
  name: 'Timer',
  props: ['endTime'],
  data() {
    return {
      test: new Date(new Date().getTime() + 20000)
    }
  },
  methods: {
    startCallBack() {},
    endCallBack() {
      // this.$router.push({ name: 'ReviewQuiz', params: { quizID: this.$route.params.quizID } })
    }
  },
}
</script>