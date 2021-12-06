import React from 'react';
import './App.css';
import battery from './5battery.png';
import onepx from './1px.png';

const Rating = ({ rating }) => {
    // TODO: find the size of the battery image programatically, check this: https://stackoverflow.com/a/49159728/4062628

    // this neat little CSS trick taken from https://www.w3schools.com/Css/css_image_sprites.asp
    const style = {
        width: `${142 * rating / 5}px`,
        height: "24px",
        background: `url(${battery}) 0 0`,
    };

    return <img src={onepx} style={style} alt="" />; 
} 

export default Rating;