const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(date));
}

module.exports = {
    formatDate
}
    