import api from "@/gateways/api";

export function getSignedUrl(context, loading, link) {
    loading.value = true
    api({
        method: "GET",
        url: "/assignments/assignment/file",
        params: {
            originalUrl: link
        }
    }).then(response => {
        let link = document.createElement('a')
        link.href = response.data.url
        link.target = "_blank"
        link.click()
    }).finally(() => {
        loading.value = false
    })
}