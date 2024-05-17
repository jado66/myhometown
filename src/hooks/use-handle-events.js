export const useHandleEvents = (setEvents) => {
    
    const deleteEvent = (eventId) => {
        setEvents(previousEvents => previousEvents.filter(event => event.id !== eventId));
    };

    const modifyEvent = (eventId, modifiedEvent) => {
        setEvents(previousEvents => previousEvents.map(event => event.id === eventId ? { ...event, ...modifiedEvent } : event));
    };

    const addEvent = (newEvent) => {
        setEvents(previousEvents => [...previousEvents, newEvent]);
    }

    return { deleteEvent, modifyEvent, addEvent };
};