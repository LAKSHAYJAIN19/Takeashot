
import targetEasy from "../assets/target_easy.png";
import targetMedium from "../assets/target_medium.png";
import targetHard from "../assets/target_hard.png";
import targetExpert from "../assets/target_expert.png";
import bowf from "../assets/bowff.png";
import lefthand from "../assets/lefthand.png"
import righthand from "../assets/righthand.png"
import scope from "../assets/bscope.png";
import arrowone from "../assets/arrowone.png";
import bgEasy from "../assets/levels/easy.png";
import bgMedium from "../assets/levels/medium.png";
import bgHard from "../assets/levels/hard.png";
import bgExpert from "../assets/levels/expert.png";
import tstand from "../assets/targetstand.png";

export const LEVELS = {
    easy: {
        stabilityTime: 4000,
        totalTime: 10000,
        aimAssist: 0.65,
        randomDrift: 4,
        windStrength: 0.8,
        errorMultiplier: 0.4,
        dynamicWind: false,
        movingTarget: false,
        shrinkingHitbox: 1,
        fatigueAfter: null,
        background: bgEasy,
        target: targetEasy,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    medium: {
        stabilityTime: 3000,
        totalTime: 10000,
        aimAssist: 0.45,
        randomDrift: 7,
        windStrength: 1.5,
        errorMultiplier: 0.7,
        dynamicWind: true,
        movingTarget: true,
        shrinkingHitbox: 1,
        fatigueAfter: 4000,
        background: bgMedium,
        target: targetMedium,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    hard: {
        stabilityTime: 2200,
        totalTime: 10000,
        aimAssist: 0.25,
        randomDrift: 11,
        windStrength: 2.5,
        errorMultiplier: 1.0,
        dynamicWind: true,
        movingTarget: true,
        shrinkingHitbox: 0.85,
        fatigueAfter: 3000,
        gustChance: 0.25,
        background: bgHard,
        target: targetHard,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    },

    expert: {
        stabilityTime: 1500,
        totalTime: 10000,
        aimAssist: 0.05,
        randomDrift: 16,
        windStrength: 3.5,
        errorMultiplier: 1.4,
        dynamicWind: true,
        movingTarget: "advanced",
        shrinkingHitbox: 0.75,
        fatigueAfter: 2500,
        gustChance: 0.35,
        adaptiveDifficulty: true,
        background: bgExpert,
        target: targetExpert,
        bow: bowf,
        frontHand: lefthand,
        backHand: righthand,
        scope: scope,
        arrowIdle: arrowone,
        stand: tstand
    }
};
