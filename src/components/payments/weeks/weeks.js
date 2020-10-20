import moment from "moment";

function getFirstFriday(date) {
    let firstFriday = new Date(date)
    firstFriday.setDate(firstFriday.getDate() + (5 + 7 - firstFriday.getDay()) % 7)
    return firstFriday
}

function initializeMonthWeeks(date) {
    let friday = getFirstFriday(date)
    let selectedMonth = friday.getMonth()
    let weeks = []
    while (friday.getMonth() === selectedMonth) {
        let startOfWeek = moment(friday).toISOString().substr(0, 10)
        friday.setDate(friday.getDate() + 7)
        let endOfWeek = friday.toISOString().substr(0, 10)
        weeks.push({
            from: startOfWeek,
            to: endOfWeek,
            status: false,
            ID: -1,
            textValue: "From: " + startOfWeek + " => To: " + endOfWeek
        })
    }
    return weeks
}

export { initializeMonthWeeks }