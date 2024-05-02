import Openrouteservice from 'openrouteservice-js'

const Isochrones = new Openrouteservice.Isochrones({ api_key: "apikey" });
let orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

async function fetchDirections(A, B) {

    const from = A.userData.centroid;
    const to = B.userData.centroid;
    console.log("Getting Directions from " + from + " and " + to);

    // orsDirections.calculate({
    //     coordinates: [from, to],
    //     profile: "driving-car",
    //     extra_info: ["waytype", "steepness"],
    //     format: "json",
    //     api_version: 'v2',
    // })
    //     .then(function (json) {
    //         // Add your own result handling here
    //         let response = JSON.stringify(json, null, "\t")
    //         console.log(response);
    //     })
    //     .catch(function (err) {
    //         let response = JSON.stringify(err, null, "\t")
    //         console.error(response);
    //     })
}

export { fetchDirections };

