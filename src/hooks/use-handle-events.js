export const useHandleEvents = (setEvents) => {
  const deleteEvent = (eventId) => {
    setEvents((previousEvents) =>
      previousEvents.filter((event) => event.id !== eventId)
    );
  };

  const modifyEvent = (modifiedEvent) => {
    const id = { modifiedEvent };

    if (!id) {
      alert("no ID!!!!");
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
