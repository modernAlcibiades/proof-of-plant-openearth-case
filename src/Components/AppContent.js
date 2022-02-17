import React from 'react';
import PlantForm from './PlantForm';
import background from '../media/pexels-scott-webb-305827.jpg';

export default function AppContent() {
    return (
        <div style={{
            backgroundImage: `url(${background}})`}}>
            <PlantForm />
        </div>
    );
}