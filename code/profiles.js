const travelProfiles = {
    driving: {
        car: {
            profile: 'driving-car',
            description: 'Standard cars, considering road types and traffic conditions.'
        },
        hgv: {
            profile: 'driving-hgv',
            description: 'Heavy goods vehicles, taking into account vehicle dimensions, weight, and road restrictions.'
        }
    },
    cycling: {
        regular: {
            profile: 'cycling-regular',
            description: 'Regular bicycles, suitable for day-to-day cycling in both urban and rural areas.'
        },
        road: {
            profile: 'cycling-road',
            description: 'Road cycling on paved surfaces, optimized for speed and distance.'
        },
        mountain: {
            profile: 'cycling-mountain',
            description: 'Mountain bikes on paths and trails suitable for rougher terrains.'
        },
        electric: {
            profile: 'cycling-electric',
            description: 'E-bikes, considering battery range and avoiding steep climbs.'
        }
    },
    walking: {
        walking: {
            profile: 'foot-walking',
            description: 'Walking in both urban and rural settings.'
        },
        hiking: {
            profile: 'foot-hiking',
            description: 'Hiking, considering trails, natural paths, and elevation changes.'
        }
    },
    wheelchair: {
        profile: 'wheelchair',
        description: 'Wheelchair users, focusing on accessible routes and avoiding obstacles like stairs.'
    }
};

// Example of how to retrieve a profile
function getProfileInfo(type, mode) {
    if (travelProfiles[type] && travelProfiles[type][mode]) {
        return travelProfiles[type][mode];
    } else {
        console.log("Invalid type or mode");
        return null; // or throw an error based on your error handling policy
    }
}

// Example usage
//   const carProfile = getProfileInfo('driving', 'car');
//   console.log(carProfile);

//   const hikingProfile = getProfileInfo('walking', 'hiking');
//   console.log(hikingProfile);

export { getProfileInfo }