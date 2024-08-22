export const useHandleEvents = (setEvents) => {
  const deleteEvent = (eventId) => {
    setEvents((previousEvents) =>
      previousEvents.filter((event) => event.id !== eventId)
    );
  };

  const modifyEvent = (modifiedEvent) => {
    alert(JSON.stringify(modifiedEvent, null, 4));
    const id = { modifiedEvent };

    if (!id) {
      return;
    }

    alert(JSON.stringify(id));

    setEvents((previousEvents) =>
      previousEvents.map((event) =>
        event.id === eventId ? { ...event, ...modifiedEvent } : [event]
      )
    );
  };

  const addEvent = (newEvent) => {
    alert(JSON.stringify(newEvent));

    setEvents((previousEvents) => [...previousEvents, newEvent]);
  };

  return { deleteEvent, modifyEvent, addEvent };
};
