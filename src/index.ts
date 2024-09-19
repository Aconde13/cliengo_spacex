import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

const spacexUrl = 'https://api.spacexdata.com/v3';

interface Launch {
    flight_number: number;
    mission_name: string;
    rocket: {
        rocket_id: string;
        rocket_name: string;
        description: string;
        images: string[];
    };
    payloads: {
        payload_id: string;
        manufacturer: string;
        type: string;
    }[];
}

const getLaunches = async () => {
    try {
        const launchesResponse = await axios.get(`${spacexUrl}/launches`);
        const rocketsResponse = await axios.get(`${spacexUrl}/rockets`);

        const launchesData = launchesResponse.data;
        const rocketsData = rocketsResponse.data;

        const launches: Launch[] = launchesData.map((launch: any) => {
            const { rocket_name, description, flickr_images } = rocketsData.find((rocket: any) => rocket.rocket_id === launch.rocket.rocket_id);

            return {
                flight_number: launch.flight_number,
                mission_name: launch.mission_name,
                rocket: {
                    rocket_id: launch.rocket.rocket_id,
                    rocket_name: rocket_name,
                    description: description,
                    images: flickr_images
                },
                payloads: launch.rocket.second_stage.payloads.map((payload : any) => ({
                    payload_id: payload.payload_id,
                    manufacturer: payload.manufacturer,
                    type: payload.payload_type
                }))
            };
        });

        return launches;
    } catch (error) {
        // console.error(error);
        throw new Error('Error getting data from SpaceX');
    }
};

app.get('/launches', async (req, res) => {
    try {
        const launches = await getLaunches();
        res.json(launches);
    } catch (error) {
        res.status(500).json({ error: 'Error getting data'});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
