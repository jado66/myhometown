import createFakeEvents from '@/util/events/create-fake-events';
import { useState, useEffect } from 'react';

const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const storedEvents = localStorage.getItem('events');

                if (storedEvents) {
                    setEvents(JSON.parse(storedEvents));
                } else {

                    const randomInt = Math.floor(Math.random() * 15)+5

                    const fakeEvents = createFakeEvents(randomInt, 'My Hometown');
                    setEvents(fakeEvents);
                    localStorage.setItem('events', JSON.stringify(fakeEvents));
                }

                setIsLoading(false);
            } catch (error) {
                setError(error);
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const deleteEvent = (eventId) => {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

    const modifyEvent = (eventId, modifiedEvent) => {
        const updatedEvents = events.map(event => {
            if (event.id === eventId) {
                return { ...event, ...modifiedEvent };
            }
            return event;
        });
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

    const updateEvent = (eventId, updatedEvent) => {
        const updatedEvents = events.map(event => {
            if (event.id === eventId) {
                return { ...event, ...updatedEvent };
            }
            return event;
        });
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

    return { events, isLoading, error, deleteEvent, modifyEvent, updateEvent };
};

export default useEvents;
