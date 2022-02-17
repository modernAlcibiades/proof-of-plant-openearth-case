import React from 'react';
import { Grid } from "@mui/material";

import PlantForm from './PlantForm';
import logo from '../media/JoshuaTree_3.png';

export default function AppContent() {
    return (
        <div className="AppContent">
            <div className="heading">
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <img className="App-logo" src={logo} />
                    </Grid>
                    <Grid item xs={10}>
                        <div className="title">
                            Proof of Plant
                        </div>
                    </Grid>

                </Grid>
            </div   >
            <PlantForm />
        </div>
    );
}