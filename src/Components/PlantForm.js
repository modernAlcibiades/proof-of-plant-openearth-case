import React, { useContext, useState } from 'react';
import { Button, Paper, Grid } from "@mui/material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import DateTimePicker from 'react-datetime-picker';
import Modal from "react-modal";
import ReactLoading from "react-loading";

import { useInput } from "../Hooks/useInput";
import { AppStateContext } from "../App";

const defaultValues = {
    datetime: "E.g. 2022/02/16 23:59", // TODO : Switch to UTC
    species: "E.g. Yucca brevifolia", // Should not be blank
    location: "E.g. 40.7580297387, -73.9855419283", // Sanity check
    stage: "E.g. seed" // Growth stage of plant - seed, seedling, young, mature
};

const list_stages = [
    "Seed",
    "Seedling",
    "Young Plant",
    "Mature Plant"
]

const list_species = [
    { name: "Joshua Tree", species: "Yucca brevifolia"},
    { name: "Red Maple", species: "Acer rubrum" },
    { name: "Loblolly Pine", species: "Pinus taeda" },
    { name: "Sweetgum", species: "Liquidambar styraciflua" },
    { name: "Douglas Fir", species: "Pseudotsuga menziesii" },
    { name: "Quaking Aspen", species: "Populus tremuloides" },
    { name: "Sugar Maple", species: "Acer saccharum" },
    { name: "Balsam Fir", species: "Abies balsamea" },
    { name: "Flowering Dogwood", species: "Cornus florida" },
    { name: "Lodgepole Pine", species: "Pinus contorta" },
    { name: "White Oak", species: "Quercus Alba" },
]
// To do
// - Decide whether to upload images or not
// - Add ipfs uri to the verification card
// - CSS
// - Generate QR code
// - Calendar option for datetime
// - Dropdown for growth stage
// - 

export default function PlantForm() {
    const { ns_client, trinsic_client, cred_id } = useContext(AppStateContext);
    // console.log(trinsic_client);
    // console.log(ns_client);
    // console.log(cred_id);

    // State and variables
    const { value: lat, setValue: setLatitude, bind: bindLat, reset: resetLat } = useInput(0.0);
    const { value: lng, setValue: setLongitude, bind: bindLng, reset: resetLng } = useInput(0.0);
    const { value: species, setValue: setSpecies, reset: resetSpecies } = useInput("");
    const { value: stage, setValue: setStage, reset: resetStage } = useInput("");
    const { value: displayImg, setValue: setDisplayImg, bind: bindDisplayImg, reset: resetDisplayImg } = useInput("");
    const { value: datetime, setValue: setDatetime } = useInput(new Date());
    const { value: tribute, setValue: setTribute, bind: bindTribute, reset: resetTribute } = useInput("");
    const { value: uri, setValue: setUri, bind: bindUri, reset: resetUri } = useInput("");

    const { value: errorMessage, setValue: setErrorMessage, bind: bindErrorMessage, reset: resetErrorMessage } = useInput("");
    
    // Modal Display settings
    const [isOpen, setIsOpen] = useState(false);
    const [qr, setQR] = useState("");
    const [modalText, setModalText] = useState(<label>{"Wait while we upload and certify your submission..."}</label>);
    // const [modalState, setModalState] = useState("return false;");
    const [modalURL, setModalURL] = useState("");

    //const [modalURL, setModalURL] = useState("https://trinsic.studio/url/e3d5b1f4-4c81-4c2e-904f-12fc9a75f1e6");

    // Event handlers
    function toggleModal() {
        setIsOpen(!isOpen);
    }

    const getInstructions = () => {
        console.log("Instructions should pop up");
    }

    const uploadImage = (event) => {
        setUri(URL.createObjectURL(event.target.files[0]));
        setDisplayImg(event.target.files[0]);
    }

    const uploadToIpfs = async event => {
        let data = {
            Datetime: datetime.toDateString(),
            Location: `(${lat}, ${lng})`,
            Species: species,
            "Growth Stage": stage,
            "Dedicated to": tribute,
        };

        let object = {
            name: "Proof Of Plant",
            description: "Record for a new plant",
            image: displayImg,
            metadata: data
        }
        const metadata = await ns_client.store(object);
        data['IPFS URL'] = metadata.url;
        return data;
    }

    const generateQR = async event => {
        toggleModal();
        let url = "https://trinsic.studio/url/06b09ac9-fb04-4ce6-b5bc-cc3710fe351e";
        setModalURL(url);
        setModalText(<a className="App-link" href={modalURL} target="_blank">Visit Trinsic for Offer Url and QR Code</a>);
        return;
        try {
            if (lat > 180 || lat < -180) {
                setErrorMessage(`Invalid Latitude ${lat}`);
                return;
            }
            if (lng > 180 || lng < -180) {
                setErrorMessage(`Invalid Longitude ${lng}`);
                return;
            }
            const metadata = await uploadToIpfs(event);
            console.log(metadata);
            let credential = await trinsic_client.createCredential({
                definitionId: cred_id,
                //connectionId: "",
                automaticIssuance: true,
                credentialValues: metadata
            });
            console.log(credential);
            //setQR(URL.createObjectURL(credential.offerData));
            setModalURL(credential.offerUrl);
            setModalText(<a href={credential.offerUrl} target="_blank">Visit Trinsic for Offer Url and QR Code</a>);
            //window.open(URL, '_blank');
        } catch (err) {
            console.log(err)
        }
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
        <div>
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

                    <Grid item xs={5}>
                        <div className="formLabel">Date / Time of Planting</div>
                    </Grid>
                    <Grid item xs={7}>
                        <DateTimePicker value={datetime} onChange={setDatetime}/>
                    </Grid>

                    <Grid item xs={5}>
                        <div className="formLabel">Location</div>
                    </Grid>
                    <Grid item xs={7}>
                        <TextField className="latitude"
                            label="Latitude"
                            type="text" {...bindLat} />
                    </Grid>
                    <Grid item xs={5}></Grid>
                    <Grid item xs={7}>
                        <TextField className="longitude"
                            label="Longitude"
                            type="text" {...bindLng} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button className="btn"
                            onClick={getCurrentLocation}>
                            Use Current Location
                        </Button>
                    </Grid>
                    <Grid item xs={5}>
                        <div className="formLabel">Species</div>
                    </Grid>
                    <Grid item xs={7}>
                        <Autocomplete
                            className="dropdown"
                            freeSolo
                            id="combo-box-demo"
                            options={list_species.map((x) => {
                                return `${x.name} (${x.species})`;
                            })}
                            sx={{ width: 300 }}
                            value={species}
                            onChange={(event, newValue) => {
                                setSpecies(newValue);
                            }}
                            onInputChange={(event, newValue) => {
                                console.log(newValue);
                                setSpecies(newValue);
                            }}
                            renderInput={(params) => <TextField className="formInput" label="Choose Species" {...params} />}
                        />
                    </Grid>

                    <Grid item xs={5}>
                        <div className="formLabel">Growth Stage</div>
                    </Grid>
                    <Grid item xs={7}>
                        <Autocomplete
                            className="dropdown"
                            disablePortal
                            id="combo-box-demo"
                            options={list_stages}
                            sx={{ width: 300 }}
                            value={stage}
                            onChange={(event, newValue) => {
                                setStage(newValue);
                            }}
                            renderInput={(params) => <TextField className="formInput" label="Choose Stage" {...params}/>}
                        />
                    </Grid>

                    <Grid item xs={5}>
                        <div className="formLabel">Dedicated to</div>
                    </Grid>
                    <Grid item xs={7}>
                        <TextField className="formInput"
                            type="text" {...bindTribute} />
                    </Grid>

                    <Grid item xs={5}>
                        <div className="formLabel">Upload Image Proof</div>
                    </Grid>
                    <Grid item xs={7}>
                        <input type="file" onChange={uploadImage} />
                    </Grid>

                    <Grid item xs={12}>
                        <Button className="btn"
                            onClick={generateQR}>
                            Generate QR
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    </Grid>

                    <Grid item xs={12}>
                        <img className="displayImg" src={uri} {...bindDisplayImg} />
                    </Grid>

                </Grid>
            </Paper>
            <Modal
                className="modal"
                isOpen={isOpen}
                onRequestClose={toggleModal}
                contentLabel="My dialog"
                ariaHideApp={false}
            >
                <div classname="formWrapper">
                    <ReactLoading type="spinningBubbles" color="#fff" />
                    <div className="formContent">
                        { //Scan QR code
                        }
                    </div>
                    <img src={qr} />
                    {modalText}
                </div>
                <Button className="btn" onClick={toggleModal}>Close</Button>
            </Modal>
        </div>
    );

}