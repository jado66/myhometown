import { faker } from '@faker-js/faker';

function createFakeEvents(n, city) {
    var events = [];
    for (var i = 0; i < n; i++) {

        var dateStart = new Date();
        var dateEnd = new Date();
        dateEnd.setDate(dateStart.getDate() + 90); // 45 days = month and a half

        var start = faker.date.between(dateStart, dateEnd);

        var end = new Date(start);

        var allDay = Math.random() < 0.1; // 10% chance for all day event

        var multiDay = Math.random() < 0.1; // 10% chance for multi-day event

        if (!allDay) {
            // Event times between 8 AM and 10 PM
            var hourStart = Math.floor(Math.random() * (22 - 8) + 8);
            var minStart = getRandomMinute();
            
            start.setHours(hourStart, minStart);
        
            var duration = Math.floor(Math.random() * 5) + 1; // event duration between 1 to 5 hours
            var hourEnd = hourStart + duration;
            var minEnd = getRandomMinute();
        
            end.setHours(hourEnd, minEnd);
        }

        if (multiDay) {
            // Multi-day event spanning 2-4 days
            end.setDate(end.getDate() + Math.floor(Math.random() * 3) + 2);
        }

        var event = {
            title: fakeEventTitles[Math.floor(Math.random() * fakeEventTitles.length)],
            location: faker.address.streetAddress()+', '+city,
            description: faker.lorem.sentences({min: 0, max: 2}),
            start: start,
            end: end,
            allDay: allDay,
            resource: null
        };
        events.push(event);
    }
    return events;
}

export default createFakeEvents;

function getRandomMinute() {
    var min = 0; // default to start of hour
    var randomNum = Math.random(); // generates a random number between 0 and 1
    
    if (randomNum < 0.45) { 
        min = 0; // start of the hour
    } else if (randomNum < 0.8) { 
        min = 30; // half past the hour
    } else {
        min = 15; // quarter past the hour or three quarters past the hour
    }
    
    return min;
}

const fakeEventTitles = 
    [
        "Movie in the Park",
        "City Marathon Challenge",
        "Music Festival in Downtown",
        "Food Truck Frenzy",
        "Annual Art Exhibition",
        "Book Fair at City Center",
        "Craft Beer Festival",
        "Farmers Market Sunday",
        "Charity Fun Run",
        "Outdoor Yoga Meetup",
        "Classic Car Showdown",
        "Local Band Concert Night",
        "Health and Wellness Fair",
        "International Food Fest",
        "Children's Book Reading",
        "Game Developer Conference",
        "Wine Tasting Event",
        "Street Dance Competition",
        "Comedy Show at Town Square",
        "Summer Jazz Concert",
        "Vintage Clothing Sale",
        "Poetry Slam Night",
        "Photography Workshop",
        "Pottery Class in the Park",
        "Film Festival",
        "Plant Swapping Day",
        "Pet Adoption Drive",
        "Cooking Class at Community Center",
        "Antique Furniture Auction",
        "Urban Gardening Workshop" ,
        "Full Moon Hiking Adventure",
        "Open Mic Night at City Cafe",
        "Citywide Treasure Hunt",
        "Kite Flying Festival",
        "Sustainable Living Workshop",
        "Regional Science Fair",
        "Community Mural Painting Day",
        "Local Theater Play Debut",
        "Weekend Farmers' Market",
        "Annual City Bake-Off",
        "Sports Fan Gathering",
        "Jazz in the Gardens",
        "Picnic and Movie Night",
        "Author Meet and Greet",
        "Skateboard Competition",
        "Bike Safety and Repair Class",
        "Dance Fitness Party in the Park",
        "Public Speaking Workshop",
        "Entrepreneur Networking Event",
        "DIY Soap Making Class",
        "Photography Contest",
        "Sunset Paint and Wine Evening",
        "Tea Tasting Extravaganza",
        "Pop-up Art Exhibition",
        "Historical Walk Through the City",
        "Murder Mystery Dinner",
        "Edible Book Festival",
        "Golf Tournament",
        "Maker Faire",
        "Origami Lessons at Library",
        "Stand-Up Comedy Night",
        "Local History Tour",
        "Classic Film Screening",
        "Indie Band Concert",
        "Improv Theater Show",
        "Weekly Coding Workshop",
        "Children's Storytime at the Library",
        "Watercolor Painting Class",
        "Salsa Dancing Lessons",
        "Farm-to-Table Cooking Demonstration",
        "Pet Adoption Fair",
        "Beginner's Pottery Workshop",
        "Sunset Photography Expedition",
        "Charity Fun Run",
        "Birdwatching Club Meetup",
        "Fall Harvest Festival",
        "Craft Beer Tasting Evening",
        "Indoor Rock Climbing Introduction",
        "Digital Art Exhibition",
        "Family Game Night",
        "DIY Furniture Building Class",
        "Poetry Slam",
        "Community Cleanup Day",
        "Wildflower Identification Walk",
        "Senior Fitness Class",
        "Teen Gaming Tournament",
        "Stargazing Party at Observatory",
        "Plant Swap Meet",
        "Antique Car Show",
        "Free First-Time Home Buyer Workshop",
        "Credit Counseling Seminar",
        "Small Business Networking Event",
        "Resume Writing and Interview Skills Workshop",
        "Health Fair with Free Screenings",
        "Charity Food Drive",
        "Community Job Fair",
        "Disaster Preparedness Training",
        "Elder Care Information Session",
        "Small Engine Repair Class",
        "Clothing Swap for Charity",
        "Neighborhood Watch Organizer Meeting",
        "Public Speaking Workshop",
        "Parenting Skills Class",
        "Veterans Services Fair",
        "Basic Car Maintenance 101 Seminar",
        "Teen Tutoring and Homework Help",
        "Pet First Aid and CPR Training Class",
        "Substance Abuse Awareness Seminar",
        "Financial Planning for Retirement Workshop",
        "Public Park Restoration Project",
        "Volunteer Firefighter Recruitment Event",
        "Babysitting Certification Course",
        "Mental Health Awareness Fair",
        "Blood Donation Drive",
        "Recycling and Sustainability Workshop",
        "Computer Literacy Class for Seniors",
        "Guild of Local Artists Meet",
        "Self-Defense Class for Women",
        "Annual Run/Walk for Charity",
        "Adult Financial Literacy Class",
        "Teen Mental Health Seminar",
        "Local Food Drive Challenge",
        "Computer Coding Workshop for Kids",
        "Public Art Project Kickoff",
        "Neighborhood Clean-Up Day",
        "Free Flu Shot Clinic",
        "Home Energy Efficiency Workshop",
        "Non-Profit Volunteer Orientation",
        "First Aid and CPR Certification Course",
        "Community Garden Planning Meetup",
        "Intro to Vegan Cooking Class",
        "Low-Cost Pet Microchipping Event",
        "Free Community Yoga Class",
        "Distracted Driving Awareness Seminar", 
        "Digital Privacy and Security Workshop",
        "E-Waste Recycling Event",
        "Women's Self-Employment workshop",
        "Youth Leadership Development Seminar",
        "Farmers Market Season Opening",
        "Poverty Eradication Discussion Forum",
        "Renewable Energy Information Session",
        "Zero Waste Lifestyle Workshop",
        "Meditation and Stress Management Seminar",
        "Emergency Kit Prepping Tutorial",
        "Hiking Safety and Wilderness Survival Class",
        "Indoor Plant Care Workshop",
        "Water Conservation Strategies Presentation",
        "Basic Household Repairs DIY Class",
        "Entrepreneurship Bootcamp"
    ]