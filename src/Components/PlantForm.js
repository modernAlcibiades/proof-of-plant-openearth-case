import React, { useEffect, useState } from 'react';
import { Button, Paper , Grid, Select, MenuItem} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import DateTimePicker from 'react-datetime-picker';

import { useInput } from "../Hooks/useInput";

const defaultValues = {
    datetime: "E.g. 2022/02/16 23:59", // TODO : Switch to UTC
    species: "E.g. Yucca brevifolia", // Should not be blank
    location: "E.g. 40.7580297387, -73.9855419283", // Sanity check
    stage: "E.g. seed" // Growth stage of plant - seed, seedling, young, mature
};

// To do
// - Decide whether to upload images or not
// - Add ipfs uri to the verification card
// - CSS
// - Generate QR code
// - Calendar option for datetime
// - Dropdown for growth stage
// - 

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
    const { value: displayImg, setValue: setDisplayImg, bind: bindDisplayImg, reset: resetDisplayImg } = useInput("");
    const [datetime, setDatetime ] = useState(new Date());

    // Event handlers
    const getInstructions = () => {
        console.log("Instructions should pop up");
    }

    const upload_to_ipfs = async event => {
        let object = {
            Datetime: datetime,
            Location: { latitude: lat, longitude: lng },
            Species: species,
            "Growth Stage": stage
            // TODO : Add image blob before storing
        };
        const metadata = await this.state.client.store(object);
    }

    const uploadImage = (event) => {
        setDisplayImg(URL.createObjectURL(event.target.files[0]));
        console.log(event.target.files);
    }

    const generateQR = event => {
        let object = {
            Datetime: datetime,
            Location: { latitude: lat, longitude: lng },
            Species: species,
            "Growth Stage": stage
            // TODO : Add image blob before storing
        };
        console.log(object);
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
        <Paper className='formWrapper'>
            <Grid className="formContent" container spacing={2}>
                <Grid item xs={12}>
                    <h2>Verify your Proof of Plant</h2>
                </Grid>

                <Grid item xs={12}>
                    <Button className="btn"
                        onClick={getInstructions}>
                        Instructions
                    </Button>
                </Grid>

                <Grid item xs={6}>
                    <div className="formLabel">Date / Time of Planting</div>
                </Grid>
                <Grid item xs={6}>
                    <DateTimePicker value={datetime} onChange={setDatetime}/>
                </Grid>

                <Grid item xs={6}>
                    <div className="formLabel">Location</div>
                </Grid>
                <Grid item xs={6} md={3}>
                    <div className="formLabel">Latitude</div>
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField className="latitude"
                        type="text" {...bindLat} />
                </Grid>
                <Grid item xs={6} md={6}></Grid>
                <Grid item xs={6} md={3}>
                    <div className="formLabel">Longitude</div>
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField className="longitude"
                        type="text" {...bindLng} />
                </Grid>
                <Grid item xs={12}>
                    <Button className="btn"
                        onClick={getCurrentLocation}>
                        Use Current Location
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <div className="formLabel">Species</div>
                </Grid>
                <Grid item xs={6}>
                    <TextField className="formInput"
                        type="text" {...bindSpecies} />
                </Grid>

                <Grid item xs={6}>
                    <div className="formLabel">Growth Stage</div>
                </Grid>
                <Grid item xs={6}>
                    <Select
                        label="Choose stage"
                        id="growth-stage-select"
                        {...bindStage}
                    >
                        <MenuItem value={"Seed"}/>
                        <MenuItem value={"Seedling"}/>
                        <MenuItem value={"Young Plant"} />
                        <MenuItem value={"Mature Plant"} />
                    </Select>
                </Grid>

                <Grid item xs={6}>
                    <div className="formLabel">Upload Image Proof</div>
                </Grid>
                <Grid item xs={6}>
                    <input type="file" onChange={uploadImage} />
                </Grid>

                <Grid item xs={6}>
                    <Button className="btn"
                        onClick={generateQR}>
                        Generate QR
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <img className="displayImg" src={displayImg} {...bindDisplayImg} />
                </Grid>

            </Grid>
        </Paper>
    );

}