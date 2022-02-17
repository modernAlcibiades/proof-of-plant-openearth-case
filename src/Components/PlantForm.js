import React, { useContext, useState , useEffect} from 'react';
import { Button, Paper, Grid, Stack} from "@mui/material";
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
    stage: "E.g. seed" // Growth stage of plant - seed, seedling, sapling, mature
};

const list_stages = [
    "Seed",
    "Seedling", 
    "Sapling",
    "Mature"
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
    const [modalText, setModalText] = useState("");
    // const [modalState, setModalState] = useState("return false;");
    const [modalURL, setModalURL] = useState("");

    // Hook
    useEffect(() => {
        resetErrorMessage();
    }, [lat, lng, species, stage, displayImg, datetime, tribute, uri]);

    // Event handlers
    function toggleModal() {
        setIsOpen(!isOpen);
    }

    const uploadImage = (event) => {
        try {
            setUri(URL.createObjectURL(event.target.files[0]));
            setDisplayImg(event.target.files[0]);
        } catch (err) {
            setErrorMessage("Invalid Image.");
            resetUri();
            resetDisplayImg();

            
        }
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
        setModalText(
            <div>
                <ReactLoading className="loading" type="spinningBubbles" color="#fff" /><br/>
                <h5>{"Wait while we upload and certify your submission..."}</h5>
            </div>);
        toggleModal();
        let credential = { offerUrl: "https://trinsic.studio/url/06b09ac9-fb04-4ce6-b5bc-cc3710fe351e" };
        try {
            if (lat > 180 || lat < -180) {
                throw(`Invalid Latitude ${lat}`);
            }
            if (lng > 180 || lng < -180) {
                throw(`Invalid Longitude ${lng}`);
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

            setModalURL(credential.offerUrl);
            setModalText(<a
                className="App-link"
                href={credential.offerUrl}
                target="_blank"
                onClick={toggleModal}>Click to visit Trinsic for Offer Url and QR Code</a>);
        } catch (err) {
            console.log(err);
            if (typeof (err) === 'string' || err instanceof String){
                setErrorMessage(err);
            } else {
                console.log("Couldn't handle");
                setErrorMessage("Failed to process. Verify inputs and try again.");
            }
            setIsOpen(false);
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

    const getInstructions = (event) => {
        setModalText(
            <Paper className="instructions">
                <h3>To issue a certification for a new plant, please do as follows</h3>
                <ul>
                    <li>Select <b>Date and Time</b>(optional) of planting</li>
                    <li>Add GPS coordinates ie <b>(latitude, longitude)</b> of the plant.  You can <b>Use Current Location</b> of your device or follow the <a href="https://support.google.com/maps/answer/18539?hl=en&co=GENIE.Platform%3DAndroid">guide</a> to add a particular location.</li>
                    <li>Choose <b>species</b> of the plant (or type new if not available)</li>
                    <li>Choose <b>growth stage</b> of the plant from the dropwdown</li>
                    <li>If you planted the tree as a tribute to someone or something, please mention them in the <b>Dedicated to </b> section</li>
                    <li>Upload an image if you have one</li>
                    <li>Click <b>Generate QR</b>. It will take a few seconds for the verification link to be ready.</li>
                    <li>Once the link is ready, click on it, and scan the QR code with your Trinsic wallet</li>
                    <li>If it doesn't work, please check the <b className="error-message">error message</b> at the bottom of your screen</li>
                </ul> 
            </Paper>
        );
        toggleModal();
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
                <Stack className="loading" spacing={2}>
                    {modalText}
                    <div className="modal-close" onClick={toggleModal}>Close</div>
                </Stack>
            </Modal>
        </div>
    );

}