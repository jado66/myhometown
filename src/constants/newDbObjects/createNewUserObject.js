export const createNewUser = (email, sub) => {
    return {
        email: email,
        _id: sub,
        contactNumber: '',
        name: '',
        role: 'None',
        cities: [],
        communities: []
    }
}