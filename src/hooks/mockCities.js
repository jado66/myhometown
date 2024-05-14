export const mockCities = [
    { 
        id: 1, 
        name: 'Spanish Fork',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 1', date: '2022-01-01', description: 'Description 1' },
            { name: 'Event 2', date: '2022-02-01', description: 'Description 2' },
            // more events...
        ],
        coordinates: { lat: 123.456, long: 789.012 },
        boundingShape: [
            { lat: 12.345, long: 67.890 },
            { lat: 23.456, long: 78.901 },
            // more coordinates...
        ],
        cityOwners: [
            { id: 1, name: 'Jadon Erwin', email: 'jd@japps.dev', contactNumber: '123-456-7890' },
            { id: 2, name: 'Jerry Craven', email: 'owner2@example.com', contactNumber: '987-654-3210' },
            // more City Admins...
        ],
        communities: [
            {
                id: 1,
                name: 'Sunny Acres',
            },
            {
                id: 14, 
                name: 'Aspen Meadows',
            }
        ]

    },
    { 
        id: 2, 
        name: 'Provo',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 3', date: '2022-03-01', description: 'Description 3' },
            { name: 'Event 4', date: '2022-04-01', description: 'Description 4' },
            // more events...
        ],
        coordinates: { lat: 456.789, long: 12.345 },
        boundingShape: [
            { lat: 34.567, long: 89.012 },
            { lat: 45.678, long: 90.123 },
            // more coordinates...
        ],
        cityOwners: [
            { name: 'Owner 3', email: 'owner3@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 4', email: 'owner4@example.com', contactNumber: '444-555-6666' },
            // more City Admins...
        ],
        communities: [
            {
                id: 2,
                name: 'Happy Valley',
            },
            {
                id: 3, 
                name: 'Pleasant View',
            }
        ]
    },
    {
        id: 3,
        name: 'Salt Lake City',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 5', date: '2022-05-01', description: 'Description 5' },
            { name: 'Event 6', date: '2022-06-01', description: 'Description 6' },
            // more events...
        ],
        coordinates: { lat: 789.012, long: 234.567 },
        boundingShape: [
            { lat: 56.789, long: 12.345 },
            { lat: 67.890, long: 23.456 },
            // more coordinates...
        ],
        cityOwners: [
            {id: 1, name: "Jadon Erwin", email: "jd@japps.dev", contactNumber: "123-456-7890"},
            { name: 'Owner 6', email: 'owner6@example.com', contactNumber: '777-888-9999' },
            // more City Admins...
        ]
    },
    {
        id: 4,
        name: 'Orem',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 7', date: '2022-07-01', description: 'Description 7' },
            { name: 'Event 8', date: '2022-08-01', description: 'Description 8' },
            // more events...
        ],
        coordinates: { lat: 890.123, long: 456.789 },
        boundingShape: [
            { lat: 78.901, long: 34.567 },
            { lat: 89.012, long: 45.678 },
            // more coordinates...
        ],
        cityOwners: [
            { name: 'Owner 7', email: 'owner7@example.com', contactNumber: '777-777-7777' },
            { name: 'Owner 8', email: 'owner8@example.com', contactNumber: '888-888-8888' },
            // more City Admins...
        ]
    },
    {
        id: 5,
        name: 'Logan',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 9', date: '2022-09-01', description: 'Description 9' },
            { name: 'Event 10', date: '2022-10-01', description: 'Description 10' },
            // more events...
        ],
        coordinates: { lat: 901.234, long: 567.890 },
        boundingShape: [
            { lat: 90.123, long: 45.678 },
            { lat: 1.234, long: 56.789 },
            // more coordinates...
        ],
        cityOwners: [
            { name: 'Owner 9', email: 'owner9@example.com', contactNumber: '999-999-9999' },
            { name: 'Owner 10', email: 'owner10@example.com', contactNumber: '100-200-3000' },
            // more City Admins...
        ]
    },
    {
        id: 6,
        name: 'Ogden',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 11', date: '2022-11-01', description: 'Description 11' },
            { name: 'Event 12', date: '2022-12-01', description: 'Description 12' },
            // more events...
        ],
        coordinates: { lat: 234.567, long: 678.901 },
        boundingShape: [
            { lat: 23.456, long: 67.890 },
            { lat: 34.567, long: 78.901 },
            // more coordinates...
        ],
        cityOwners: [
            { name: 'Owner 11', email: 'owner11@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 12', email: 'owner12@example.com', contactNumber: '444-555-6666' },
            // more City Admins...
        ]
    },
    {
        id: 7,
        name: 'St. George',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 13', date: '2023-01-01', description: 'Description 1' },
            { name: 'Event 14', date: '2023-02-01', description: 'Description 2' },
        ],
        coordinates: { lat: 345.678, long: 789.012 },
        boundingShape: [
            { lat: 45.678, long: 89.012 },
            { lat: 56.789, long: 90.123 },
        ],
        cityOwners: [
            { name: 'Owner 13', email: 'owner13@example.com', contactNumber: '333-444-5555' },
            { name: 'Owner 14', email: 'owner14@example.com', contactNumber: '666-777-8888' },
        ]
    },
    {
        id: 8,
        name: 'Cedar City',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 15', date: '2023-03-01', description: 'Description 3' },
            { name: 'Event 16', date: '2023-04-01', description: 'Description 4' },
        ],
        coordinates: { lat: 456.789, long: 12.345 },
        boundingShape: [
            { lat: 67.890, long: 23.456 },
            { lat: 78.901, long: 34.567 },
        ],
        cityOwners: [
            { name: 'Owner 15', email: 'owner15@example.com', contactNumber: '888-999-1111' },
            { name: 'Owner 16', email: 'owner16@example.com', contactNumber: '222-333-4444' },
        ]
    },
    {
        id: 9,
        name: 'Clearfield',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 17', date: '2023-05-01', description: 'Description 5' },
            { name: 'Event 18', date: '2023-06-01', description: 'Description 6' },
        ],
        coordinates: { lat: 567.890, long: 234.567 },
        boundingShape: [
            { lat: 78.901, long: 34.567 },
            { lat: 89.012, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 17', email: 'owner17@example.com', contactNumber: '333-444-5555' },
            { name: 'Owner 18', email: 'owner18@example.com', contactNumber: '666-777-8888' },
        ]
    },
    {
        id: 10,
        name: 'Vinyard',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 19', date: '2023-07-01', description: 'Description 7' },
            { name: 'Event 20', date: '2023-08-01', description: 'Description 8' },
        ],
        coordinates: { lat: 678.901, long: 345.678 },
        boundingShape: [
            { lat: 90.123, long: 56.789 },
            { lat: 1.234, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 19', email: 'owner19@example.com', contactNumber: '999-111-2222' },
            { name: 'Owner 20', email: 'owner20@example.com', contactNumber: '333-444-5555' },
        ]
    },
    {
        id: 11,
        name: 'Draper',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 21', date: '2023-09-01', description: 'Description 9' },
            { name: 'Event 22', date: '2023-10-01', description: 'Description 10' },
        ],
        coordinates: { lat: 789.012, long: 456.789 },
        boundingShape: [
            { lat: 2.345, long: 78.901 },
            { lat: 23.456, long: 89.012 },
        ],
        cityOwners: [
            { name: 'Owner 21', email: 'owner21@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 22', email: 'owner22@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 12,
        name: 'Saratoga Springs',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 13,
        name: 'Riverton',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 14,
        name: 'Herriman',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 15,
        name: 'Lehi',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 16,
        name: 'Layton',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 17,
        name: 'Payson',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 18,
        name: 'Bluffdale',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 19,
        name: 'South Jordan',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 20,
        name: 'West Jordan',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 21,
        name: 'Eagle Mountain',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 22,
        name: 'Midvale',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 23,
        name: 'Holladay',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 24,
        name: 'Sandy',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 25,
        name: 'Toole',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 26,
        name: 'Taylorsville',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 27,
        name: 'Cedar Hills',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 28,
        name: 'American Fork',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 29,
        name: 'Pleasant Grove',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 30,
        name: 'Springville',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 31,
        name: 'Farmington',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 32,
        name: 'North Salt Lake',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 33,
        name: 'Santaquin',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 34,
        name: 'Mapleton',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 35,
        name: 'Alpine',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 36,
        name: 'Highland',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 37,
        name: 'Park City',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 38,
        name: 'Heber City',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 23', date: '2023-11-01', description: 'Description 11' },
            { name: 'Event 24', date: '2023-12-01', description: 'Description 12' },
        ],
        coordinates: { lat: 890.123, long: 567.890 },
        boundingShape: [
            { lat: 34.567, long: 1.234 },
            { lat: 45.678, long: 23.456 },
        ],
        cityOwners: [
            { name: 'Owner 23', email: 'owner23@example.com', contactNumber: '444-555-6666' },
            { name: 'Owner 24', email: 'owner24@example.com', contactNumber: '777-888-9999' },
        ]
    },
    {
        id: 39,
        name: 'Honeyville',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 40,
        name: 'Daybreak',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 41,
        name: 'Beaver',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 42,
        name: 'Hurricane',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 43,
        name: 'Parowan',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 44,
        name: 'Enoch',
        state: 'Utah',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 45,
        name: 'Boise',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 46,
        name: 'Meridian',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 47,
        name: 'Nampa',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 48,
        name: 'Caldwell',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 49,
        name: 'Rexburg',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 25', date: '2024-01-01', description: 'Description 13' },
            { name: 'Event 26', date: '2024-02-01', description: 'Description 14' },
        ],
        coordinates: { lat: 901.234, long: 678.901 },
        boundingShape: [
            { lat: 56.789, long: 34.567 },
            { lat: 67.890, long: 45.678 },
        ],
        cityOwners: [
            { name: 'Owner 25', email: 'owner25@example.com', contactNumber: '111-222-3333' },
            { name: 'Owner 26', email: 'owner26@example.com', contactNumber: '444-555-6666' },
        ]
    },
    {
        id: 50,
        name: 'Idaho Falls',
        state: 'Idaho',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    },
    {
        id: 50,
        name: 'Las Vegas',
        state: 'Nevada',
        country: 'USA',
        upcomingEvents: [
            { name: 'Event 27', date: '2024-03-01', description: 'Description 15' },
            { name: 'Event 28', date: '2024-04-01', description: 'Description 16' },
        ],
        coordinates: { lat: 12.345, long: 789.012 },
        boundingShape: [
            { lat: 78.901, long: 56.789 },
            { lat: 89.012, long: 67.890 },
        ],
        cityOwners: [
            { name: 'Owner 27', email: 'owner27@example.com', contactNumber: '777-888-9999' },
            { name: 'Owner 28', email: 'owner28@example.com', contactNumber: '111-222-3333' },
        ]
    }
    // more cities...
];