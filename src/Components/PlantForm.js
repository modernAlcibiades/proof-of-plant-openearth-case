import React, { useEffect, useState } from 'react';
import { Button, Paper } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useInput } from "../Hooks/useInput";

const defaultValues = {
    datetime: "E.g. 2022/02/16 23:59", // TODO : Switch to UTC
    species: "E.g. Yucca brevifolia", // Should not be blank
    location: "E.g. 40.7580297387, -73.9855419283", // Sanity check
    stage: "E.g. seed" // Growth stage of plant - seed, seedling, young, mature
};

export default function PlantForm() {
    // State and variables
    // const [datetimeValue, setDatetime] = useState("");
    // const [speciesValue, setSpecies] = useState("");
    // const [latitudeValue, setLatitude] = useState("0.0");
    // const [longitudeValue, setLongitude] = useState("0.0");

    const { value: lat, setValue: setLatitude, bind: bindLat, reset: resetLat } = useInput(0.0);
    const { value: lng, setValue: setLongitude, bind: bindLng, reset: resetLng } = useInput(0.0);
    const { value: species, bind: bindSpecies, reset: resetSpecies } = useInput("Yucca brevifolia");
    const { value: stage, bind: bindStage, reset: resetStage } = useInput("");
    const { value: datetime, bind: bindDatetime, reset: resetDatetime } = useInput("");


    const upload_to_ipfs = async event => {
        let object = {
            Datetime: datetime,
            Location: { latitude: lat, longitude: lng },
            Species: species,
            "Growth Stage": stage
        };
        const metadata = await this.state.client.store(object);
    }

    // Event handlers
    const uploadImage = (event) => {
        console.log(event.target.files)
    }

    const generateQR = event => {
        console.log(event.target);
    }

    const getCurrentLocation = (event) => {
        const geolocation = navigator.geolocation;
        geolocation.getCurrentPosition(
            position => {
                console.log(position);
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            () => {
                console.log(new Error("Permission denied"));
            }
        );  
    }

    return (
        <Paper>
            <h2>Verify your Proof of Plant</h2>
            <input type="file" onChange={uploadImage} />
            <img id="proof_image" />
            <TextField className="latitude"
                type="text" {...bindLat}/>
            <span/>
            <TextField className="longitude"
                type="text" {...bindLng} />
            <Button onClick={getCurrentLocation}>Generate</Button>
            <Button onClick={generateQR}>Generate QR</Button>
        </Paper>
    );

}