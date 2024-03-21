import { useState, useEffect } from 'react';

export default function useCommunities(email = null) {
    const [communities, setCommunities] = useState([]);
    const [selectOptions, setSelectOptions] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        // Fetch communities from localStorage
        const storedCommunities = JSON.parse(localStorage.getItem('communities'));
        
        let finalCommunities = storedCommunities || mockCommunities;

        if (email) {
            finalCommunities = finalCommunities.filter(community =>
                community.communityOwners.some(owner => owner.email === email)
            );
        } 
    
        setCommunities(finalCommunities);

        if (!storedCommunities) {
            setCommunities(mockCommunities);
            localStorage.setItem('communities', JSON.stringify(mockCommunities));
        }

        setHasLoaded(true);
    }, []);

    useEffect(() => {
        // Save communities to localStorage
        if (hasLoaded) {
            localStorage.setItem('communities', JSON.stringify(communities));
        }

        const newSelectOptions = communities.map(community => ({
            value: community.id,
            label: community.name // or any other user property that you want to display in the dropdown
        }));

        setSelectOptions(newSelectOptions);

    }, [communities]);

    const handleAddCommunity = (community) => {
        setCommunities([...communities, community]);
    };

    const handleEditCommunity = (id, community) => {
        setCommunities(communities.map((c) => (c.id === id ? community : c)));
    };

    const handleDeleteCommunity = (id) => {
        setCommunities(communities.filter((c) => c.id !== id));
    };

    return {
        communities,
        hasLoaded,
        selectOptions,
        handleAddCommunity,
        handleEditCommunity,
        handleDeleteCommunity,
    };
}

const mockCommunities = [
    { 
        id: 1, 
        name: 'Sunny Acres',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 2, 
        name: 'Oakwood Heights',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 3, 
        name: 'Ivy Ridge',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 4, 
        name: 'Blossom Valley',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 5, 
        name: 'Maple Grove',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 6, 
        name: 'Elm Court',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 7, 
        name: 'Pine Haven',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 8, 
        name: 'Chestnut Manor',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 9, 
        name: 'Cedar View',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 10, 
        name: 'Willow Hill',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 11, 
        name: 'Hawthorn Hollow',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 12, 
        name: 'Spruce Village',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 13, 
        name: 'Birchwood Park',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 14, 
        name: 'Aspen Meadows',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 15, 
        name: 'Rosemary Bluff',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 16, 
        name: 'Sagebrook',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    { 
        id: 17, 
        name: 'Mintleaf Square',
        community: 'Community 1',
        state: "Utah",
        communityId: 1,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 1', email: 'owner1@example.com', contactNumber: '123-456-7890' },
            { name: 'Owner 2', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more community owners...
        ]
    },
    { 
        id: 18, 
        name: 'Lavender Fields',
        state: "Utah",
        communityId: 1,
        community: 'Community 1',
        googleCalendarId: 'calendar2',
        classes: [
            { name: 'Class 3', instructor: 'Instructor 3', schedule: 'Wednesday 10:00 AM - 12:00 PM' },
            { name: 'Class 4', instructor: 'Instructor 4', schedule: 'Thursday 3:00 PM - 5:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more community owners...
        ]
    },
    {
        id: 19,
        name: 'South Provo',
        community: 'Provo',
        state: "Utah",
        communityId: 2,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'JD Erwin', email: 'jd@japps.com', contactNumber: '111-222-3333'}
        ]
    },
    {
        id: 20,
        name: 'Provo West',
        community: 'Provo',
        state: "Utah",
        communityId: 2,
        googleCalendarId: 'calendar1',
        classes: [
            { name: 'Class 1', instructor: 'Instructor 1', schedule: 'Monday 9:00 AM - 11:00 AM' },
            { name: 'Class 2', instructor: 'Instructor 2', schedule: 'Tuesday 2:00 PM - 4:00 PM' },
            // more classes...
        ],
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        communityOwners: [
            { name: 'JD Erwin'}
        ]
        
    }
        
    // more communities...
];



