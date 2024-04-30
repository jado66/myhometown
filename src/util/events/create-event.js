function createEvent(title, start, end, allDay = false, resource = null) {
    return {
        title: title,
        start: start,
        end: end,
        allDay: allDay,
        resource: resource
    };
}

export default createEvent;