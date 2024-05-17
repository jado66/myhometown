export const createNewCommunity = (community) => {
    return {
        name: '',
        city: '',
        state: '',
        country: 'USA',
        events: [
        ],
        coordinates: { lat: 123.456, long: 789.012 },
        boundingShape: [
        ],
        communityOwners: [
        ],
        visibility: false,
        ...community
    }
}