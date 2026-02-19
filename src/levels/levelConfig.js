
import targetEasy from "../assets/target_easy.png";
import targetMedium from "../assets/target_medium.png";
import targetHard from "../assets/target_hard.png";
import targetExpert from "../assets/target_expert.png";
import bowf from "../assets/bowff.png";
import lefthand from "../assets/lefthand.png"
import righthand from "../assets/righthand.png"
import scope from "../assets/bscope.png";
import bowstring from "../assets/bowstring.svg"
import arrowone from "../assets/arrowone.png";
import bgEasy from "../assets/levels/easy.png";
import bgMedium from "../assets/levels/medium.png";
import bgHard from "../assets/levels/hard.png";
import bgExpert from "../assets/levels/expert.png";
import tstand from "../assets/targetstand.png";

export const LEVELS = {
    easy: {
        stabilityTime: 2000,
        totalTime: 10000,
        aimAssist: 0.65,
        randomDrift: 4,
        windStrength: 0.25,
        errorMultiplier: 0.4,
        background: bgEasy,
        target: targetEasy,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        string: bowstring,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    medium: {
        stabilityTime: 2500,
        totalTime: 10000,
        aimAssist: 0.45,
        randomDrift: 7,
        windStrength: 0.45,
        errorMultiplier: 0.7,
        background: bgMedium,
        target: targetMedium,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        string: bowstring,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    hard: {
        stabilityTime: 3000,
        totalTime: 10000,
        aimAssist: 0.25,
        randomDrift: 11,
        windStrength: 0.7,
        errorMultiplier: 1.0,
        background: bgHard,
        target: targetHard,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        string: bowstring,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    expert: {
        stabilityTime: 3500,
        totalTime: 10000,
        aimAssist: 0.05,
        randomDrift: 16,
        windStrength: 1.1,
        errorMultiplier: 1.4,
        background: bgExpert,
        target: targetExpert,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        string: bowstring,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    }
};
