export const createNewCity = (city) => {
    return {
        name: '',
        state: '',
        country: 'USA',
        upcomingEvents: [
        ],
        coordinates: { lat: 123.456, long: 789.012 },
        boundingShape: [
        ],
        cityOwners: [
        ],
        communities: [
        ],
        visibility: false,
        ...city
    }
}